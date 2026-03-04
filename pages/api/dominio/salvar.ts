import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { getUserFromApiRequest } from "@/lib/auth-api";
import { verificarCnameDominio } from "@/lib/dns";

function normalizarDominio(dominio: string) {
  return dominio
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const user = await getUserFromApiRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const { dominio } = req.body;

  if (!dominio || typeof dominio !== "string") {
    return res.status(400).json({ error: "Domínio é obrigatório" });
  }

  const dominioNormalizado = normalizarDominio(dominio);

  const dominioRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;
  if (!dominioRegex.test(dominioNormalizado)) {
    return res.status(400).json({ error: "Domínio inválido" });
  }

  const dominiosBloqueados = ["automatech.app.br", "imobhub.automatech.app.br"];

  if (dominiosBloqueados.includes(dominioNormalizado)) {
    return res.status(400).json({ error: "Este domínio não pode ser utilizado" });
  }

  // Verifica se domínio já está em uso por outro usuário
  const { data: dominioEmUso } = await supabaseAdmin
    .from("Dominio")
    .select("id")
    .eq("dominio", dominioNormalizado)
    .neq("userId", user.id)
    .maybeSingle();

  if (dominioEmUso) {
    return res.status(409).json({ error: "Domínio já está em uso por outro corretor" });
  }

  const dnsCheck = await verificarCnameDominio(dominioNormalizado);
  const agora = new Date().toISOString();
  const novoStatus = dnsCheck.ok ? "ATIVO" : "PENDENTE";

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
      })
      .eq("id", dominioExistente.id);
  } else {
    await supabaseAdmin.from("Dominio").insert({
      id: randomUUID(),
      dominio: dominioNormalizado,
      status: novoStatus,
      userId: user.id,
      verificadoEm: dnsCheck.ok ? agora : null,
      ultimaVerificacao: agora,
    });
  }

  if (dnsCheck.ok) {
    return res.status(200).json({
      ok: true,
      dominio: dominioNormalizado,
      status: "ATIVO",
      mensagem: "Domínio salvo e verificado com sucesso! Já está ativo.",
    });
  } else {
    return res.status(200).json({
      ok: true,
      dominio: dominioNormalizado,
      status: "PENDENTE",
      mensagem: "Domínio salvo. Configure o DNS para ativar.",
      dnsDetalhes: {
        error: dnsCheck.error,
        expected: dnsCheck.expected,
        found: dnsCheck.found,
      },
    });
  }
}
