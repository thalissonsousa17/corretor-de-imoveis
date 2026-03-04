import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { getUserFromApiRequest } from "@/lib/auth-api";
import { verificarCnameDominio } from "@/lib/dns";

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

    // GET — carregar domínio do usuário
    if (req.method === "GET") {
      const { data: dominio } = await supabaseAdmin
        .from("Dominio")
        .select("dominio,status,verificadoEm,ultimaVerificacao")
        .eq("userId", user.id)
        .maybeSingle();

      return res.status(200).json(dominio);
    }

    // POST — salvar / atualizar domínio
    if (req.method === "POST") {
      const { dominio } = req.body as DominioRequestBody;

      if (!dominio || typeof dominio !== "string") {
        return res.status(400).json({ error: "O campo domínio é obrigatório." });
      }

      const dominioNormalizado = normalizarDominio(dominio);

      // Verificar se o domínio já está em uso por outro usuário
      const { data: dominioEmUso } = await supabaseAdmin
        .from("Dominio")
        .select("id")
        .eq("dominio", dominioNormalizado)
        .neq("userId", user.id)
        .maybeSingle();

      if (dominioEmUso) {
        return res
          .status(409)
          .json({ error: "Este domínio já está sendo utilizado por outro corretor." });
      }

      // Verificar DNS automaticamente
      const dnsCheck = await verificarCnameDominio(dominioNormalizado);

      const novoStatus = dnsCheck.ok ? "ATIVO" : "PENDENTE";
      const agora = new Date().toISOString();

      // Upsert manual para garantir integridade
      const { data: dominioExistente } = await supabaseAdmin
        .from("Dominio")
        .select("id")
        .eq("userId", user.id)
        .maybeSingle();

      if (dominioExistente) {
        await supabaseAdmin
          .from("Dominio")
          .update({
            dominio: dominioNormalizado,
            status: novoStatus,
            verificadoEm: dnsCheck.ok ? agora : null,
            ultimaVerificacao: agora,
            updatedAt: agora,
          })
          .eq("id", dominioExistente.id);
      } else {
        await supabaseAdmin.from("Dominio").insert({
          id: randomUUID(),
          dominio: dominioNormalizado,
          userId: user.id,
          status: novoStatus,
          verificadoEm: dnsCheck.ok ? agora : null,
          ultimaVerificacao: agora,
          createdAt: agora,
          updatedAt: agora,
        });
      }

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
