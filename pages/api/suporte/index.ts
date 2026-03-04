import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // GET — listar tickets
  if (req.method === "GET") {
    try {
      let query = supabaseAdmin
        .from("TicketSuporte")
        .select("*, user:User(name,email), mensagens:MensagemSuporte(conteudo,createdAt,lida,autorId)")
        .order("updatedAt", { ascending: false });

      if (userRole !== "ADMIN") {
        query = query.eq("userId", userId);
      }

      const { data: tickets } = await query;

      // Contar mensagens não lidas para cada ticket em JS
      const ticketsComNaoLidas = (tickets ?? []).map((ticket: any) => {
        const naoLidas = (ticket.mensagens ?? []).filter(
          (m: any) => !m.lida && m.autorId !== userId
        ).length;
        return { ...ticket, naoLidas };
      });

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
      const ticketId = randomUUID();
      const { data: ticket, error } = await supabaseAdmin
        .from("TicketSuporte")
        .insert({
          id: ticketId,
          assunto,
          descricao,
          prioridade: prioridade || "MEDIA",
          userId,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);

      // Cria mensagem inicial automaticamente
      await supabaseAdmin.from("MensagemSuporte").insert({
        id: randomUUID(),
        conteudo: descricao,
        autorId: userId,
        ticketId,
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
