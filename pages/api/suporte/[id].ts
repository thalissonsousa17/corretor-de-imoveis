import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido." });
  }

  // Busca o ticket
  const ticket = await prisma.ticketSuporte.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket não encontrado." });
  }

  // Verifica acesso: dono do ticket ou admin
  if (ticket.userId !== userId && userRole !== "ADMIN") {
    return res.status(403).json({ message: "Acesso negado." });
  }

  // GET — buscar mensagens do ticket
  if (req.method === "GET") {
    try {
      const mensagens = await prisma.mensagemSuporte.findMany({
        where: { ticketId: id },
        include: {
          autor: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "asc" as const },
      });

      // Marca como lidas as mensagens que não são do usuario atual
      await prisma.mensagemSuporte.updateMany({
        where: {
          ticketId: id,
          autorId: { not: userId },
          lida: false,
        },
        data: { lida: true },
      });

      return res.status(200).json({
        ticket: {
          id: ticket.id,
          assunto: ticket.assunto,
          descricao: ticket.descricao,
          status: ticket.status,
          prioridade: ticket.prioridade,
          createdAt: ticket.createdAt,
          user: ticket.user,
        },
        mensagens,
      });
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // POST — enviar mensagem
  if (req.method === "POST") {
    const { conteudo } = req.body;

    if (!conteudo) {
      return res.status(400).json({ message: "Conteúdo é obrigatório." });
    }

    try {
      const mensagem = await prisma.mensagemSuporte.create({
        data: {
          conteudo,
          autorId: userId,
          ticketId: id,
        },
        include: {
          autor: { select: { name: true, role: true } },
        },
      });

      // Atualiza status e updatedAt do ticket em uma única chamada
      const shouldUpdateStatus =
        ticket.status === "RESOLVIDO" || (ticket.status === "ABERTO" && userRole === "ADMIN");

      await prisma.ticketSuporte.update({
        where: { id },
        data: {
          ...(shouldUpdateStatus && { status: "EM_ANDAMENTO" as const }),
          updatedAt: new Date(),
        },
      });

      return res.status(201).json(mensagem);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // PATCH — atualizar status do ticket
  // Admin pode qualquer status; corretor só pode reabrir ticket FECHADO
  if (req.method === "PATCH") {
    const { status } = req.body;
    const validStatus = ["ABERTO", "EM_ANDAMENTO", "RESOLVIDO", "FECHADO"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    if (userRole !== "ADMIN") {
      if (ticket.status !== "FECHADO" || status !== "ABERTO") {
        return res.status(403).json({ message: "Apenas administradores podem alterar o status." });
      }
    }

    try {
      const updated = await prisma.ticketSuporte.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
