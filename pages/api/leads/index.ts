import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import * as cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Public endpoint for Sales Page
    try {
      const { nome, email, whatsapp, mensagem } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ message: "Nome e Email são obrigatórios." });
      }

      const lead = await prisma.lead.create({
        data: {
          nome,
          email,
          whatsapp,
          mensagem,
        },
      });

      return res.status(201).json(lead);
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      return res.status(500).json({ message: "Erro interno ao salvar lead." });
    }
  }

  if (req.method === "GET") {
    // Admin only endpoint - Manual Auth Check because authorize middleware wraps the whole handler
    try {
      const cookies = cookie.parse(req.headers.cookie || "");
      const sessionId = cookies.sessionId;

      if (!sessionId) {
        return res.status(401).json({ message: "Não autorizado." });
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ message: "Sessão inválida ou expirada." });
      }

      // Check for Admin role if necessary
      // if (session.user.role !== "ADMIN") return res.status(403).json({ message: "Acesso negado." });

      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(leads);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      return res.status(500).json({ message: "Erro ao buscar leads.", error: String(error) });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
