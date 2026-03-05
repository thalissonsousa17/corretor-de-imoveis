import type { NextApiResponse } from "next";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabase";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Não autenticado" });

  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const { titulo, conteudo } = req.body;

    if (!titulo || !conteudo) {
      return res.status(400).json({ error: "Título e conteúdo são obrigatórios" });
    }

    try {
      const { data: contrato } = await supabaseAdmin
        .from("Contrato")
        .select("id")
        .eq("id", id)
        .eq("corretorId", userId)
        .maybeSingle();

      if (!contrato) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }

      const { data: atualizado, error } = await supabaseAdmin
        .from("Contrato")
        .update({ titulo, conteudo, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      return res.status(200).json(atualizado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar contrato" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { data: contrato } = await supabaseAdmin
        .from("Contrato")
        .select("id")
        .eq("id", id)
        .eq("corretorId", userId)
        .maybeSingle();

      if (!contrato) {
        return res.status(404).json({ error: "Contrato não encontrado" });
      }

      await supabaseAdmin.from("Contrato").delete().eq("id", id);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao excluir contrato" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
});
