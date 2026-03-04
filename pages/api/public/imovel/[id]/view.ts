import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const imovelId = req.query.id as string;

  try {
    // Verificar se o imovel existe
    const { data: imovel } = await supabaseAdmin
      .from("Imovel")
      .select("id")
      .eq("id", imovelId)
      .maybeSingle();

    if (!imovel) {
      return res.status(404).json({ message: "Imovel nao encontrado." });
    }

    await supabaseAdmin.from("ImovelView").insert({ id: randomUUID(), imovelId });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar view:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}
