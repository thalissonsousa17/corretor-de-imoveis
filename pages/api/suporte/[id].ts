import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido." });
  }

  // Busca o ticket
  const { data: ticket } = await supabaseAdmin
    .from("TicketSuporte")
    .select("*, user:User(name,email)")
    .eq("id", id)
    .maybeSingle();

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
      const { data: mensagens } = await supabaseAdmin
        .from("MensagemSuporte")
        .select("*, autor:User(name,role)")
        .eq("ticketId", id)
        .order("createdAt", { ascending: true });

      // Marca como lidas as mensagens que não são do usuário atual
      await supabaseAdmin
        .from("MensagemSuporte")
        .update({ lida: true })
        .eq("ticketId", id)
        .neq("autorId", userId)
        .eq("lida", false);

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
        mensagens: mensagens ?? [],
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
      const { data: mensagem, error } = await supabaseAdmin
        .from("MensagemSuporte")
        .insert({
          id: randomUUID(),
          conteudo,
          autorId: userId,
          ticketId: id,
        })
        .select("*, autor:User(name,role)")
        .single();

      if (error) throw new Error(error.message);

      // Atualiza status e updatedAt do ticket
      const shouldUpdateStatus =
        ticket.status === "RESOLVIDO" || (ticket.status === "ABERTO" && userRole === "ADMIN");

      await supabaseAdmin
        .from("TicketSuporte")
        .update({
          ...(shouldUpdateStatus && { status: "EM_ANDAMENTO" }),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id);

      return res.status(201).json(mensagem);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  // PATCH — atualizar status do ticket
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
      const { data: updated, error } = await supabaseAdmin
        .from("TicketSuporte")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      return res.status(500).json({ message: "Erro interno." });
    }
  }

  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
