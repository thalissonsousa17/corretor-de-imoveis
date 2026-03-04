import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const { nome, whatsapp, email, tipo, localizacao, mensagem, corretorId, origem } = req.body;

    if (!nome || !whatsapp || !corretorId) {
      return res.status(400).json({ error: "Nome, WhatsApp e ID do corretor são obrigatórios." });
    }

    // Verifica se o corretor existe
    const { data: corretor } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("id", corretorId)
      .maybeSingle();

    if (!corretor) {
      return res.status(404).json({ error: "Corretor não encontrado." });
    }

    // Combina tipo + localização no campo imovelInteresse
    const imovelInteresse =
      tipo && localizacao
        ? `${tipo} - ${localizacao}`
        : tipo || localizacao || null;

    const { data: lead, error } = await supabaseAdmin
      .from("Lead")
      .insert({
        id: randomUUID(),
        nome,
        email: email?.trim() || "",
        whatsapp,
        mensagem: mensagem || "Gostaria de uma avaliação para venda do meu imóvel.",
        imovelInteresse,
        corretorId,
        origem: origem || "SITE",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json(lead);
  } catch (error) {
    console.error("Erro ao criar lead público:", error);
    return res.status(500).json({ error: "Erro interno ao salvar lead." });
  }
}
