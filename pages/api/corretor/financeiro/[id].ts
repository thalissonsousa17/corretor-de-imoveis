import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;
  const comissaoId = req.query.id as string;

  const comissao = await prisma.comissao.findUnique({ where: { id: comissaoId } });
  if (!comissao || comissao.corretorId !== corretorId) {
    return res.status(404).json({ message: "Comissão não encontrada." });
  }

  // PATCH — atualizar
  if (req.method === "PATCH") {
    try {
      const { descricao, valorImovel, percentual, valorComissao, tipo, status, dataVenda, dataRecebimento, observacoes, imovelId } = req.body;

      const updated = await prisma.comissao.update({
        where: { id: comissaoId },
        data: {
          ...(descricao !== undefined && { descricao: descricao.trim() }),
          ...(valorImovel !== undefined && { valorImovel: valorImovel ? parseFloat(valorImovel) : null }),
          ...(percentual !== undefined && { percentual: percentual ? parseFloat(percentual) : null }),
          ...(valorComissao !== undefined && { valorComissao: parseFloat(valorComissao) }),
          ...(tipo !== undefined && { tipo }),
          ...(status !== undefined && { status }),
          ...(dataVenda !== undefined && { dataVenda: dataVenda ? new Date(dataVenda) : null }),
          ...(dataRecebimento !== undefined && { dataRecebimento: dataRecebimento ? new Date(dataRecebimento) : null }),
          ...(observacoes !== undefined && { observacoes: observacoes?.trim() || null }),
          ...(imovelId !== undefined && { imovelId: imovelId || null }),
        },
        include: {
          imovel: { select: { id: true, titulo: true, cidade: true } },
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar comissão:", error);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      await prisma.comissao.delete({ where: { id: comissaoId } });
      return res.status(200).json({ message: "Comissão removida." });
    } catch (error) {
      console.error("Erro ao remover comissão:", error);
      return res.status(500).json({ message: "Erro ao remover." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
