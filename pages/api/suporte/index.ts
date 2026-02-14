import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // GET — listar tickets
  if (req.method === "GET") {
    try {
      const where: { userId?: string } = userRole === "ADMIN" ? {} : { userId };

      const tickets = await prisma.ticketSuporte.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          mensagens: {
            orderBy: { createdAt: "desc" as const },
            take: 1,
            select: { conteudo: true, createdAt: true, lida: true, autorId: true },
          },
          _count: {
            select: { mensagens: true },
          },
        },
        orderBy: { updatedAt: "desc" as const },
      });

      // Contar mensagens não lidas para cada ticket
      const ticketsComNaoLidas = await Promise.all(
        tickets.map(async (ticket) => {
          const naoLidas = await prisma.mensagemSuporte.count({
            where: {
              ticketId: ticket.id,
              lida: false,
              autorId: { not: userId },
            },
          });
          return { ...ticket, naoLidas };
        })
      );

      return res.status(200).json(ticketsComNaoLidas);
    } catch (error) {
      console.error("Erro ao listar tickets:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — criar ticket
  if (req.method === "POST") {
    const { assunto, descricao, prioridade } = req.body;

    if (!assunto || !descricao) {
      return res.status(400).json({ message: "Assunto e descrição são obrigatórios." });
    }

    try {
      const ticket = await prisma.ticketSuporte.create({
        data: {
          assunto,
          descricao,
          prioridade: prioridade || "MEDIA",
          userId,
        },
      });

      // Cria mensagem inicial automaticamente
      await prisma.mensagemSuporte.create({
        data: {
          conteudo: descricao,
          autorId: userId,
          ticketId: ticket.id,
        },
      });

      return res.status(201).json(ticket);
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
