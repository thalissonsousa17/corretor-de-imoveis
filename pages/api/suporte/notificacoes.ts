import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  const userId = req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";

  try {
    if (isAdmin) {
      // Admin vê todas as mensagens não lidas de outros usuários
      const { count } = await supabaseAdmin
        .from("MensagemSuporte")
        .select("*", { count: "exact", head: true })
        .neq("autorId", userId)
        .eq("lida", false);

      return res.status(200).json({ naoLidas: count ?? 0 });
    } else {
      // Corretor só vê não lidas dos seus próprios tickets
      const { data: myTickets } = await supabaseAdmin
        .from("TicketSuporte")
        .select("id")
        .eq("userId", userId);

      const ticketIds = (myTickets ?? []).map((t: any) => t.id);

      if (ticketIds.length === 0) {
        return res.status(200).json({ naoLidas: 0 });
      }

      const { count } = await supabaseAdmin
        .from("MensagemSuporte")
        .select("*", { count: "exact", head: true })
        .in("ticketId", ticketIds)
        .neq("autorId", userId)
        .eq("lida", false);

      return res.status(200).json({ naoLidas: count ?? 0 });
    }
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}

export default authorize(handler);
