import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const visitaId = req.query.id as string;

  const { data: visita } = await supabaseAdmin
    .from("Visita")
    .select("*")
    .eq("id", visitaId)
    .maybeSingle();

  if (!visita || visita.corretorId !== corretorId) {
    return res.status(404).json({ message: "Visita nao encontrada." });
  }

  // PATCH — atualizar visita
  if (req.method === "PATCH") {
    try {
      const { dataHora, nomeVisitante, telefoneVisitante, emailVisitante, observacoes, status, imovelId } = req.body;

      const dataToUpdate: Record<string, unknown> = {};
      if (dataHora !== undefined) dataToUpdate.dataHora = new Date(dataHora).toISOString();
      if (nomeVisitante !== undefined) dataToUpdate.nomeVisitante = nomeVisitante.trim();
      if (telefoneVisitante !== undefined) dataToUpdate.telefoneVisitante = telefoneVisitante?.trim() || null;
      if (emailVisitante !== undefined) dataToUpdate.emailVisitante = emailVisitante?.trim() || null;
      if (observacoes !== undefined) dataToUpdate.observacoes = observacoes?.trim() || null;
      if (status !== undefined) dataToUpdate.status = status;
      if (imovelId !== undefined) dataToUpdate.imovelId = imovelId || null;

      const { data: updated, error } = await supabaseAdmin
        .from("Visita")
        .update(dataToUpdate)
        .eq("id", visitaId)
        .select("*, imovel:Imovel(id,titulo,localizacao,cidade)")
        .single();

      if (error) throw new Error(error.message);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar visita:", error);
      return res.status(500).json({ message: "Erro ao atualizar visita." });
    }
  }

  // DELETE — remover visita
  if (req.method === "DELETE") {
    try {
      await supabaseAdmin.from("Visita").delete().eq("id", visitaId);
      return res.status(200).json({ message: "Visita removida." });
    } catch (error) {
      console.error("Erro ao remover visita:", error);
      return res.status(500).json({ message: "Erro ao remover visita." });
    }
  }

  return res.status(405).json({ message: "Metodo nao permitido." });
}

export default authorize(handler);
