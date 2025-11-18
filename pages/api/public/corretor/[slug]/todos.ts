import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== "string") return res.status(400).json({ error: "Slug inválido" });

  try {
    const corretor = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!corretor) return res.status(404).json({ error: "Corretor não encontrado" });

    const imoveis = await prisma.imovel.findMany({
      where: { corretorId: corretor.userId },
      include: { fotos: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ imoveis });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno." });
  }
}
