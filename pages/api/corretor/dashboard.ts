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
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const fim7dias = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);

      // ── Imóveis ──────────────────────────────────────────────────
      const [totalImoveis, imovelDisponiveis, imovelVendido, imovelAlugado, imovelInativo] =
        await Promise.all([
          prisma.imovel.count({ where: { corretorId: userId } }),
          prisma.imovel.count({ where: { corretorId: userId, status: ImovelStatus.DISPONIVEL } }),
          prisma.imovel.count({ where: { corretorId: userId, status: ImovelStatus.VENDIDO } }),
          prisma.imovel.count({ where: { corretorId: userId, status: ImovelStatus.ALUGADO } }),
          prisma.imovel.count({ where: { corretorId: userId, status: ImovelStatus.INATIVO } }),
        ]);

      const tipoImoveis = await prisma.imovel.groupBy({
        by: ["tipo"],
        _count: { tipo: true },
        where: { corretorId: userId },
      });
      const graficoTipos = tipoImoveis.map((item) => ({
        tipo: item.tipo,
        quantidade: item._count.tipo,
      }));

      const imoveisRecentes = await prisma.imovel.findMany({
        where: { corretorId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, titulo: true, tipo: true, preco: true, status: true, createdAt: true },
      });

      // ── Leads ────────────────────────────────────────────────────
      const leadsNovos = await prisma.lead.count({
        where: { corretorId: userId, status: "NOVO" },
      });

      const leadsRecentes = await prisma.lead.findMany({
        where: { corretorId: userId, status: "NOVO" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, nome: true, email: true, whatsapp: true, imovelInteresse: true, createdAt: true },
      });

      // ── Visitas ──────────────────────────────────────────────────
      const visitasHoje = await prisma.visita.count({
        where: {
          corretorId: userId,
          status: { in: ["AGENDADA", "CONFIRMADA"] },
          dataHora: {
            gte: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()),
            lt: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1),
          },
        },
      });

      const visitas7dias = await prisma.visita.count({
        where: {
          corretorId: userId,
          status: { in: ["AGENDADA", "CONFIRMADA"] },
          dataHora: { gte: agora, lte: fim7dias },
        },
      });

      const proximasVisitas = await prisma.visita.findMany({
        where: {
          corretorId: userId,
          status: { in: ["AGENDADA", "CONFIRMADA"] },
          dataHora: { gte: agora },
        },
        orderBy: { dataHora: "asc" },
        take: 5,
        include: {
          imovel: { select: { id: true, titulo: true } },
        },
      });

      // ── Contratos ────────────────────────────────────────────────
      const contratosMes = await prisma.contrato.count({
        where: { corretorId: userId, createdAt: { gte: inicioMes } },
      });

      // ── Tickets ──────────────────────────────────────────────────
      const ticketsAbertos = await prisma.ticketSuporte.count({
        where: { userId, status: { in: ["ABERTO", "EM_ANDAMENTO"] } },
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
        atividade: {
          leadsNovos,
          visitasHoje,
          visitas7dias,
          contratosMes,
          ticketsAbertos,
        },
        proximasVisitas,
        leadsRecentes,
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      return res.status(500).json({ error: "Erro interno ao carregar o dashboard." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
