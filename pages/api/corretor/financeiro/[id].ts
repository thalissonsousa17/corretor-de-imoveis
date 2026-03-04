import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const comissaoId = req.query.id as string;

  const { data: comissao } = await supabaseAdmin
    .from("Comissao")
    .select("*")
    .eq("id", comissaoId)
    .maybeSingle();

  if (!comissao || comissao.corretorId !== corretorId) {
    return res.status(404).json({ message: "Comissão não encontrada." });
  }

  // PATCH — atualizar
  if (req.method === "PATCH") {
    try {
      const { descricao, valorImovel, percentual, valorComissao, tipo, status, dataVenda, dataRecebimento, observacoes, imovelId } = req.body;

      const dataToUpdate: Record<string, unknown> = {};
      if (descricao !== undefined) dataToUpdate.descricao = descricao.trim();
      if (valorImovel !== undefined) dataToUpdate.valorImovel = valorImovel ? parseFloat(valorImovel) : null;
      if (percentual !== undefined) dataToUpdate.percentual = percentual ? parseFloat(percentual) : null;
      if (valorComissao !== undefined) dataToUpdate.valorComissao = parseFloat(valorComissao);
      if (tipo !== undefined) dataToUpdate.tipo = tipo;
      if (status !== undefined) dataToUpdate.status = status;
      if (dataVenda !== undefined) dataToUpdate.dataVenda = dataVenda ? new Date(dataVenda).toISOString() : null;
      if (dataRecebimento !== undefined) dataToUpdate.dataRecebimento = dataRecebimento ? new Date(dataRecebimento).toISOString() : null;
      if (observacoes !== undefined) dataToUpdate.observacoes = observacoes?.trim() || null;
      if (imovelId !== undefined) dataToUpdate.imovelId = imovelId || null;

      const { data: updated, error } = await supabaseAdmin
        .from("Comissao")
        .update(dataToUpdate)
        .eq("id", comissaoId)
        .select("*, imovel:Imovel(id,titulo,cidade)")
        .single();

      if (error) throw new Error(error.message);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar comissão:", error);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      await supabaseAdmin.from("Comissao").delete().eq("id", comissaoId);
      return res.status(200).json({ message: "Comissão removida." });
    } catch (error) {
      console.error("Erro ao remover comissão:", error);
      return res.status(500).json({ message: "Erro ao remover." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
