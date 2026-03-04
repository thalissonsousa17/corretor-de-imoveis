import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { tipo, userId, assunto, mensagem } = req.body;

  if (!assunto?.trim() || !mensagem?.trim()) {
    return res.status(400).json({ message: "Assunto e mensagem são obrigatórios." });
  }

  if (!["individual", "broadcast"].includes(tipo)) {
    return res.status(400).json({ message: "Tipo inválido." });
  }

  try {
    // Mensagem individual para um corretor específico
    if (tipo === "individual") {
      if (!userId) {
        return res.status(400).json({ message: "userId é obrigatório para mensagem individual." });
      }

      const { data: target } = await supabaseAdmin
        .from("User")
        .select("id,role")
        .eq("id", userId)
        .maybeSingle();

      if (!target || target.role !== "CORRETOR") {
        return res.status(404).json({ message: "Corretor não encontrado." });
      }

      const ticketId = randomUUID();
      await supabaseAdmin.from("TicketSuporte").insert({
        id: ticketId,
        assunto,
        descricao: mensagem,
        status: "EM_ANDAMENTO",
        prioridade: "MEDIA",
        userId,
      });

      await supabaseAdmin.from("MensagemSuporte").insert({
        id: randomUUID(),
        conteudo: mensagem,
        autorId: req.user!.id,
        lida: false,
        ticketId,
      });

      return res.status(201).json({ message: "Mensagem enviada com sucesso.", ticketId });
    }

    // Broadcast para todos os corretores
    if (tipo === "broadcast") {
      const { data: corretores } = await supabaseAdmin
        .from("User")
        .select("id")
        .eq("role", "CORRETOR");

      if (!corretores || corretores.length === 0) {
        return res.status(400).json({ message: "Nenhum corretor cadastrado." });
      }

      for (const corretor of corretores) {
        const ticketId = randomUUID();
        await supabaseAdmin.from("TicketSuporte").insert({
          id: ticketId,
          assunto,
          descricao: mensagem,
          status: "EM_ANDAMENTO",
          prioridade: "MEDIA",
          userId: corretor.id,
        });
        await supabaseAdmin.from("MensagemSuporte").insert({
          id: randomUUID(),
          conteudo: mensagem,
          autorId: req.user!.id,
          lida: false,
          ticketId,
        });
      }

      return res.status(201).json({
        message: `Notificação enviada para ${corretores.length} corretor(es).`,
      });
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return res.status(500).json({ message: "Erro interno ao enviar mensagem." });
  }
}

export default authorize(handler, "ADMIN");
