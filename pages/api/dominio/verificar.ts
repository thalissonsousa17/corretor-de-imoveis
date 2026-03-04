import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserFromApiRequest } from "@/lib/auth-api";
import { verificarCnameDominio } from "@/lib/dns";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const user = await getUserFromApiRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // Verifica plano
  const { data: profile } = await supabaseAdmin
    .from("CorretorProfile")
    .select("plano")
    .eq("userId", user.id)
    .maybeSingle();

  if (!profile || (profile.plano !== "EXPERT" && profile.plano !== "GRATUITO")) {
    return res.status(403).json({ error: "Plano necessário" });
  }

  // Busca domínio do usuário
  const { data: dominio } = await supabaseAdmin
    .from("Dominio")
    .select("*")
    .eq("userId", user.id)
    .maybeSingle();

  if (!dominio) {
    return res.status(400).json({ error: "Nenhum domínio para verificar" });
  }

  // Verifica DNS
  const resultado = await verificarCnameDominio(dominio.dominio);
  const agora = new Date().toISOString();

  const novoStatus = resultado.ok ? "ATIVO" : "PENDENTE";

  await supabaseAdmin
    .from("Dominio")
    .update({
      status: novoStatus,
      verificadoEm: resultado.ok ? agora : null,
      ultimaVerificacao: agora,
    })
    .eq("id", dominio.id);

  return res.status(200).json({
    ok: resultado.ok,
    status: novoStatus,
    mensagem: resultado.ok ? "Domínio ativado com sucesso!" : "DNS ainda não propagado.",
    detalhes: resultado,
  });
}
