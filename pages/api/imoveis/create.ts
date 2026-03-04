import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { LIMITE_IMOVEIS_POR_PLANO } from "@/lib/planos";
import { getSession } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { data: profile } = await supabaseAdmin
      .from("CorretorProfile")
      .select("*")
      .eq("userId", session.userId)
      .maybeSingle();

    if (!profile) {
      return res.status(403).json({ error: "Perfil não encontrado" });
    }

    if (profile.planoStatus === "EXPIRADO") {
      await supabaseAdmin
        .from("CorretorProfile")
        .update({
          plano: "GRATUITO",
          planoStatus: "ATIVO",
          planoCanceladoEm: new Date().toISOString(),
        })
        .eq("id", profile.id);
    }

    const { count: totalImoveis } = await supabaseAdmin
      .from("Imovel")
      .select("*", { count: "exact", head: true })
      .eq("corretorId", session.userId);

    const limite = LIMITE_IMOVEIS_POR_PLANO[profile.plano];

    if (limite !== Infinity && (totalImoveis ?? 0) >= limite) {
      return res.status(403).json({
        error: "Limite do plano atingido. Faça upgrade para continuar.",
        code: "PLANO_LIMITE_ATINGIDO",
      });
    }

    const { data: imovel, error } = await supabaseAdmin
      .from("Imovel")
      .insert({
        id: randomUUID(),
        ...req.body,
        corretorId: session.userId,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return res.status(201).json(imovel);
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
