import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import { ImovelStatus } from "@prisma/client";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  if (req.method === "GET") {
    try {
      const tipoImoveis = await prisma.imovel.groupBy({
        by: ["tipo"],
        _count: { tipo: true },
        where: { corretorId: userId },
      });

      const graficoTipos = tipoImoveis.map((item) => ({
        tipo: item.tipo,
        quantidade: item._count.tipo,
      }));
      const totalImoveis = await prisma.imovel.count({
        where: { corretorId: userId },
      });

      const imovelDisponiveis = await prisma.imovel.count({
        where: { corretorId: userId, status: ImovelStatus.DISPONIVEL },
      });

      const imovelVendido = await prisma.imovel.count({
        where: { corretorId: userId, status: ImovelStatus.VENDIDO },
      });

      const imovelAlugado = await prisma.imovel.count({
        where: { corretorId: userId, status: ImovelStatus.ALUGADO },
      });

      const imovelInativo = await prisma.imovel.count({
        where: { corretorId: userId, status: ImovelStatus.INATIVO },
      });

      const imoveisRecentes = await prisma.imovel.findMany({
        where: { corretorId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          titulo: true,
          tipo: true,
          preco: true,
          status: true,
          createdAt: true,
        },
      });

      return res.status(200).json({
        stats: {
          total: totalImoveis,
          disponiveis: imovelDisponiveis,
          vendidos: imovelVendido,
          alugados: imovelAlugado,
          inativos: imovelInativo,
        },
        recentes: imoveisRecentes,
        graficoTipos,
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      return res.status(500).json({ error: "Erro interno ao carregar o dashboard." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
