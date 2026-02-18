import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const imovelId = req.query.id as string;

  try {
    // Verificar se o imovel existe
    const imovel = await prisma.imovel.findUnique({ where: { id: imovelId }, select: { id: true } });
    if (!imovel) {
      return res.status(404).json({ message: "Imovel nao encontrado." });
    }

    await prisma.imovelView.create({
      data: { imovelId },
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar view:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}
