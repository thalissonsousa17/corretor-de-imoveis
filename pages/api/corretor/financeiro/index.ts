import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import type { StatusComissao, TipoComissao } from "@prisma/client";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;

  // GET — listar comissões
  if (req.method === "GET") {
    try {
      const { status, tipo } = req.query;

      const where: { corretorId: string; status?: StatusComissao; tipo?: TipoComissao } = { corretorId };
      if (status && status !== "TODOS") where.status = status as StatusComissao;
      if (tipo && tipo !== "TODOS") where.tipo = tipo as TipoComissao;

      const comissoes = await prisma.comissao.findMany({
        where,
        include: {
          imovel: { select: { id: true, titulo: true, cidade: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Totais
      const todas = await prisma.comissao.findMany({
        where: { corretorId },
        select: { valorComissao: true, status: true, dataRecebimento: true },
      });

      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

      const totalRecebido = todas
        .filter((c) => c.status === "RECEBIDA")
        .reduce((s, c) => s + c.valorComissao, 0);

      const totalPendente = todas
        .filter((c) => c.status === "PENDENTE")
        .reduce((s, c) => s + c.valorComissao, 0);

      const recebidoMes = todas
        .filter(
          (c) =>
            c.status === "RECEBIDA" &&
            c.dataRecebimento &&
            c.dataRecebimento >= inicioMes
        )
        .reduce((s, c) => s + c.valorComissao, 0);

      return res.status(200).json({
        comissoes,
        resumo: { totalRecebido, totalPendente, recebidoMes },
      });
    } catch (error) {
      console.error("Erro ao listar comissões:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — criar comissão
  if (req.method === "POST") {
    try {
      const { descricao, valorImovel, percentual, valorComissao, tipo, dataVenda, observacoes, imovelId } = req.body;

      if (!descricao?.trim() || valorComissao === undefined) {
        return res.status(400).json({ message: "Descrição e valor da comissão são obrigatórios." });
      }

      if (imovelId) {
        const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } });
        if (!imovel || imovel.corretorId !== corretorId) {
          return res.status(400).json({ message: "Imóvel não encontrado." });
        }
      }

      const comissao = await prisma.comissao.create({
        data: {
          descricao: descricao.trim(),
          valorImovel: valorImovel ? parseFloat(valorImovel) : null,
          percentual: percentual ? parseFloat(percentual) : null,
          valorComissao: parseFloat(valorComissao),
          tipo: tipo || "VENDA",
          dataVenda: dataVenda ? new Date(dataVenda) : null,
          observacoes: observacoes?.trim() || null,
          imovelId: imovelId || null,
          corretorId,
        },
        include: {
          imovel: { select: { id: true, titulo: true, cidade: true } },
        },
      });

      return res.status(201).json(comissao);
    } catch (error) {
      console.error("Erro ao criar comissão:", error);
      return res.status(500).json({ message: "Erro ao criar comissão." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
