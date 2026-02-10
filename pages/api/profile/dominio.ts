import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromApiRequest } from "@/lib/auth-api";

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

  // Adicione aqui TODAS as URLs que podem acessar essa API
  const allowedOrigins = [
    "https://imobhub.automatech.app.br",
    "https://corretor-de-imoveis.vercel.app", // Troque pelo seu domínio real da Vercel
  ];

  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Responde imediatamente a requisições de teste (Pre-flight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ------------------------------------

  try {
    const user = await getUserFromApiRequest(req);

    // Se o erro 401 continuar, verifique se o NEXTAUTH_SECRET é o mesmo no servidor e na Vercel
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

      // 🔍 Upsert manual para garantir integridade
      const dominioExistente = await prisma.dominio.findFirst({
        where: { userId: user.id },
      });

      if (dominioExistente) {
        await prisma.dominio.update({
          where: { id: dominioExistente.id },
          data: {
            dominio: dominioNormalizado,
            status: "PENDENTE",
            verificadoEm: null,
            ultimaVerificacao: null,
          },
        });
      } else {
        await prisma.dominio.create({
          data: {
            dominio: dominioNormalizado,
            userId: user.id,
          },
        });
      }

      return res.status(200).json({
        mensagem: "Domínio salvo com sucesso. Aguardando verificação DNS.",
      });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error) {
    console.error("Erro na API de Domínio:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}
