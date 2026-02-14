import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  const userId = req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";

  try {
    // Admin vê todas as mensagens não lidas; corretor só dos seus tickets
    const whereClause: any = {
      autorId: { not: userId },
      lida: false,
    };

    if (!isAdmin) {
      whereClause.ticket = { userId };
    }

    const count = await prisma.mensagemSuporte.count({
      where: whereClause,
    });

    return res.status(200).json({ naoLidas: count });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}

export default authorize(handler);
