import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromApiRequest } from "@/lib/auth-api";
import { verificarCnameDominio } from "@/lib/dns"; // ← IMPORTAR

interface DominioRequestBody {
  dominio?: string;
}

function normalizarDominio(dominio: string): string {
  return dominio
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- CONFIGURAÇÃO DE CORS DINÂMICA ---
  const origin = req.headers.origin;

  const allowedOrigins = [
    "https://imobhub.automatech.app.br",
    "https://corretor-de-imoveis.vercel.app",
  ];

  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ------------------------------------

  try {
    const user = await getUserFromApiRequest(req);

    if (!user) {
      return res
        .status(401)
        .json({ error: "Sessão não encontrada. Por favor, faça login novamente." });
    }

    // 🔹 GET — carregar domínio do usuário
    if (req.method === "GET") {
      const dominio = await prisma.dominio.findFirst({
        where: { userId: user.id },
        select: {
          dominio: true,
          status: true,
          verificadoEm: true,
          ultimaVerificacao: true,
        },
      });
      return res.status(200).json(dominio);
    }

    // 🔹 POST — salvar / atualizar domínio
    if (req.method === "POST") {
      const { dominio } = req.body as DominioRequestBody;

      if (!dominio || typeof dominio !== "string") {
        return res.status(400).json({ error: "O campo domínio é obrigatório." });
      }

      const dominioNormalizado = normalizarDominio(dominio);

      // 🔒 Verificar se o domínio já está em uso por outro usuário
      const dominioEmUso = await prisma.dominio.findFirst({
        where: {
          dominio: dominioNormalizado,
          NOT: { userId: user.id },
        },
      });

      if (dominioEmUso) {
        return res
          .status(409)
          .json({ error: "Este domínio já está sendo utilizado por outro corretor." });
      }

      // ✅ VERIFICAR DNS AUTOMATICAMENTE
      const dnsCheck = await verificarCnameDominio(dominioNormalizado);

      const novoStatus = dnsCheck.ok ? "ATIVO" : "PENDENTE";
      const agora = new Date();

      // 🔍 Upsert manual para garantir integridade
      const dominioExistente = await prisma.dominio.findFirst({
        where: { userId: user.id },
      });

      if (dominioExistente) {
        await prisma.dominio.update({
          where: { id: dominioExistente.id },
          data: {
            dominio: dominioNormalizado,
            status: novoStatus,
            verificadoEm: dnsCheck.ok ? agora : null,
            ultimaVerificacao: agora,
          },
        });
      } else {
        await prisma.dominio.create({
          data: {
            dominio: dominioNormalizado,
            userId: user.id,
            status: novoStatus,
            verificadoEm: dnsCheck.ok ? agora : null,
            ultimaVerificacao: agora,
          },
        });
      }

      // ✅ Retornar mensagem apropriada baseada no resultado
      if (dnsCheck.ok) {
        return res.status(200).json({
          mensagem: "Domínio salvo e verificado com sucesso! Já está ativo.",
          status: "ATIVO",
        });
      } else {
        return res.status(200).json({
          mensagem: "Domínio salvo. Configure o DNS para ativar.",
          status: "PENDENTE",
          dnsError: dnsCheck.error,
          expected: dnsCheck.expected,
        });
      }
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de Domínio:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}
