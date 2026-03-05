import { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";

export default authorize(
  async (req: AuthApiRequest, res: NextApiResponse) => {
    const { id } = req.query as { id: string };

    if (req.method === "PUT") {
      const { titulo, descricao, conteudo, videoUrl, tipo, ordem, ativo } = req.body;
      if (!titulo?.trim()) return res.status(400).json({ message: "Título é obrigatório." });

      const { error } = await supabaseAdmin
        .from("AjudaItem")
        .update({
          titulo: titulo.trim(),
          descricao: descricao?.trim() ?? "",
          conteudo: conteudo ?? null,
          videoUrl: videoUrl?.trim() || null,
          tipo: tipo === "VIDEO" ? "VIDEO" : "DOCUMENTACAO",
          ordem: Number(ordem) || 0,
          ativo: ativo !== false,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) return res.status(500).json({ message: "Erro ao atualizar item." });
      return res.status(200).json({ message: "Atualizado." });
    }

    if (req.method === "DELETE") {
      const { error } = await supabaseAdmin.from("AjudaItem").delete().eq("id", id);
      if (error) return res.status(500).json({ message: "Erro ao deletar item." });
      return res.status(200).json({ message: "Deletado." });
    }

    return res.status(405).json({ message: "Método não permitido." });
  },
  ["ADMIN"]
);
