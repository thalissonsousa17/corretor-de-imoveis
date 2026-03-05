import { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import { randomUUID } from "node:crypto";

export default authorize(
  async (req: AuthApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("AjudaItem")
        .select("*")
        .order("ordem", { ascending: true })
        .order("createdAt", { ascending: true });

      if (error) return res.status(500).json({ message: "Erro ao buscar itens." });
      return res.status(200).json(data ?? []);
    }

    if (req.method === "POST") {
      const { titulo, descricao, conteudo, videoUrl, tipo, ordem } = req.body;
      if (!titulo?.trim()) return res.status(400).json({ message: "Título é obrigatório." });

      const now = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from("AjudaItem")
        .insert({
          id: randomUUID(),
          titulo: titulo.trim(),
          descricao: descricao?.trim() ?? "",
          conteudo: conteudo ?? null,
          videoUrl: videoUrl?.trim() || null,
          tipo: tipo === "VIDEO" ? "VIDEO" : "DOCUMENTACAO",
          ordem: Number(ordem) || 0,
          ativo: true,
          createdAt: now,
          updatedAt: now,
        })
        .select("*")
        .single();

      if (error) return res.status(500).json({ message: "Erro ao criar item." });
      return res.status(201).json(data);
    }

    return res.status(405).json({ message: "Método não permitido." });
  },
  ["ADMIN"]
);
