import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { randomUUID } from "node:crypto";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;

  // GET — listar leads do corretor
  if (req.method === "GET") {
    try {
      const { data: leads, error } = await supabaseAdmin
        .from("Lead")
        .select("*")
        .eq("corretorId", corretorId)
        .order("createdAt", { ascending: false });

      if (error) throw new Error(error.message);
      return res.status(200).json(leads ?? []);
    } catch (error) {
      console.error("Erro ao listar leads:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — criar lead manualmente
  if (req.method === "POST") {
    try {
      const { nome, email, whatsapp, telefone, mensagem, observacoes, imovelInteresse, origem } = req.body;

      if (!nome?.trim()) {
        return res.status(400).json({ message: "Nome é obrigatório." });
      }

      const { data: lead, error } = await supabaseAdmin
        .from("Lead")
        .insert({
          id: randomUUID(),
          nome: nome.trim(),
          email: email?.trim() || "",
          whatsapp: whatsapp?.trim() || null,
          telefone: telefone?.trim() || null,
          mensagem: mensagem?.trim() || null,
          observacoes: observacoes?.trim() || null,
          imovelInteresse: imovelInteresse?.trim() || null,
          origem: origem || "MANUAL",
          corretorId,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return res.status(201).json(lead);
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      return res.status(500).json({ message: "Erro ao criar lead." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
