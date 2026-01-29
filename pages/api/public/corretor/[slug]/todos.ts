import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const normalizeUrl = (url: string) => {
  if (!url) return "";
  const fileName = url.split(/[\\/]/).pop();
  return `/api/uploads/${fileName}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== "string") return res.status(400).json({ error: "Slug inválido" });

  try {
    const corretor = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!corretor) return res.status(404).json({ error: "Corretor não encontrado" });

    const imoveisRaw = await prisma.imovel.findMany({
      where: { corretorId: corretor.userId },
      include: { fotos: true },
      orderBy: { createdAt: "desc" },
    });

    const imoveis = imoveisRaw.map((imovel) => ({
      ...imovel,
      fotos: imovel.fotos.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    }));

    return res.status(200).json({ imoveis });
  } catch (error) {
    console.error("Erro na API pública:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
}
