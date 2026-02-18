import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const corretorId = req.user!.id;

  // GET — listar visitas do corretor (filtro por mes/ano opcional)
  if (req.method === "GET") {
    try {
      const { mes, ano } = req.query;

      const where: { corretorId: string; dataHora?: { gte: Date; lt: Date } } = { corretorId };

      if (mes && ano) {
        const m = parseInt(mes as string, 10) - 1;
        const a = parseInt(ano as string, 10);
        const inicio = new Date(a, m, 1);
        const fim = new Date(a, m + 1, 1);
        where.dataHora = { gte: inicio, lt: fim };
      }

      const visitas = await prisma.visita.findMany({
        where,
        include: {
          imovel: { select: { id: true, titulo: true, localizacao: true, cidade: true } },
        },
        orderBy: { dataHora: "asc" },
      });

      return res.status(200).json(visitas);
    } catch (error) {
      console.error("Erro ao listar visitas:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — agendar visita
  if (req.method === "POST") {
    try {
      const { dataHora, nomeVisitante, telefoneVisitante, emailVisitante, observacoes, imovelId } = req.body;

      if (!dataHora || !nomeVisitante?.trim()) {
        return res.status(400).json({ message: "Data/hora e nome do visitante sao obrigatorios." });
      }

      // Verificar se o imovel pertence ao corretor (se informado)
      if (imovelId) {
        const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } });
        if (!imovel || imovel.corretorId !== corretorId) {
          return res.status(400).json({ message: "Imovel nao encontrado." });
        }
      }

      const visita = await prisma.visita.create({
        data: {
          dataHora: new Date(dataHora),
          nomeVisitante: nomeVisitante.trim(),
          telefoneVisitante: telefoneVisitante?.trim() || null,
          emailVisitante: emailVisitante?.trim() || null,
          observacoes: observacoes?.trim() || null,
          imovelId: imovelId || null,
          corretorId,
        },
        include: {
          imovel: { select: { id: true, titulo: true, localizacao: true, cidade: true } },
        },
      });

      return res.status(201).json(visita);
    } catch (error) {
      console.error("Erro ao agendar visita:", error);
      return res.status(500).json({ message: "Erro ao agendar visita." });
    }
  }

  return res.status(405).json({ message: "Metodo nao permitido." });
}

export default authorize(handler);
