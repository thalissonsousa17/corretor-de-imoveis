import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const corretorId = req.user!.id;

  try {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicio30d = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    // IDs dos imoveis do corretor
    const imoveisDoCorretor = await prisma.imovel.findMany({
      where: { corretorId },
      select: { id: true, titulo: true },
    });
    const imovelIds = imoveisDoCorretor.map((i) => i.id);

    if (imovelIds.length === 0) {
      return res.status(200).json({
        viewsMes: 0,
        viewsTotal: 0,
        viewsDiarias: [],
        topImoveis: [],
      });
    }

    // Views este mes
    const viewsMes = await prisma.imovelView.count({
      where: {
        imovelId: { in: imovelIds },
        createdAt: { gte: inicioMes },
      },
    });

    // Views total
    const viewsTotal = await prisma.imovelView.count({
      where: { imovelId: { in: imovelIds } },
    });

    // Views diarias (ultimos 30 dias)
    const viewsRaw = await prisma.imovelView.findMany({
      where: {
        imovelId: { in: imovelIds },
        createdAt: { gte: inicio30d },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar por dia
    const viewsPorDia: Record<string, number> = {};
    for (let d = 0; d < 30; d++) {
      const date = new Date(inicio30d.getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      viewsPorDia[key] = 0;
    }
    for (const v of viewsRaw) {
      const key = v.createdAt.toISOString().slice(0, 10);
      if (viewsPorDia[key] !== undefined) {
        viewsPorDia[key]++;
      }
    }
    const viewsDiarias = Object.entries(viewsPorDia).map(([data, count]) => ({
      data,
      views: count,
    }));

    // Top 5 imoveis por views (este mes)
    const topImoveisRaw = await prisma.imovelView.groupBy({
      by: ["imovelId"],
      where: {
        imovelId: { in: imovelIds },
        createdAt: { gte: inicioMes },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const titulosMap = new Map(imoveisDoCorretor.map((i) => [i.id, i.titulo]));
    const topImoveis = topImoveisRaw.map((t) => ({
      imovelId: t.imovelId,
      titulo: titulosMap.get(t.imovelId) || "Imovel",
      views: t._count.id,
    }));

    return res.status(200).json({
      viewsMes,
      viewsTotal,
      viewsDiarias,
      topImoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}

export default authorize(handler);
