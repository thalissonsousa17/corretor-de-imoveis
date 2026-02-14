import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    return res.status(200).json({ adminExists: !!adminExists });
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}
