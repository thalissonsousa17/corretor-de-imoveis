import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { status } = req.body;

      const lead = await prisma.lead.update({
        where: { id: String(id) },
        data: { status },
      });

      return res.status(200).json(lead);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      return res.status(500).json({ message: "Erro ao atualizar lead." });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default authorize(handler);
