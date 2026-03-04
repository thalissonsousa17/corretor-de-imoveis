import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const leadId = req.query.id as string;

  const { data: lead } = await supabaseAdmin
    .from("Lead")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (!lead || lead.corretorId !== corretorId) {
    return res.status(404).json({ message: "Lead não encontrado." });
  }

  // PATCH — atualizar lead
  if (req.method === "PATCH") {
    try {
      const { nome, email, whatsapp, telefone, mensagem, observacoes, imovelInteresse, status } = req.body;

      const dataToUpdate: Record<string, unknown> = {};
      if (nome !== undefined) dataToUpdate.nome = nome.trim();
      if (email !== undefined) dataToUpdate.email = email.trim();
      if (whatsapp !== undefined) dataToUpdate.whatsapp = whatsapp?.trim() || null;
      if (telefone !== undefined) dataToUpdate.telefone = telefone?.trim() || null;
      if (mensagem !== undefined) dataToUpdate.mensagem = mensagem?.trim() || null;
      if (observacoes !== undefined) dataToUpdate.observacoes = observacoes?.trim() || null;
      if (imovelInteresse !== undefined) dataToUpdate.imovelInteresse = imovelInteresse?.trim() || null;
      if (status !== undefined) dataToUpdate.status = status;

      const { data: updated, error } = await supabaseAdmin
        .from("Lead")
        .update(dataToUpdate)
        .eq("id", leadId)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      return res.status(500).json({ message: "Erro ao atualizar lead." });
    }
  }

  // DELETE — remover lead
  if (req.method === "DELETE") {
    try {
      await supabaseAdmin.from("Lead").delete().eq("id", leadId);
      return res.status(200).json({ message: "Lead removido." });
    } catch (error) {
      console.error("Erro ao remover lead:", error);
      return res.status(500).json({ message: "Erro ao remover lead." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
