import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const normalizeUrl = (url: string | null) => {
  if (!url) return "";
  const fileName = url.split(/[\\/]/).pop();
  return `/api/uploads/${fileName}`;
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (typeof slug !== "string") return res.status(400).json({ message: "Slug inválido." });

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: { select: { name: true } } },
    });

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    const imoveisRaw = await prisma.imovel.findMany({
      where: { corretorId: profile.userId, status: "DISPONIVEL" },
      include: { fotos: { orderBy: { ordem: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const imoveis = imoveisRaw.map((imovel) => ({
      ...imovel,
      fotoPrincipal: imovel.fotos?.[0]?.url ? normalizeUrl(imovel.fotos[0].url) : "",
      fotos: undefined,
    }));

    return res.status(200).json({
      corretor: {
        name: profile.user.name,
        avatarUrl: normalizeUrl(profile.avatarUrl),
        slug: profile.slug,
      },
      imoveis,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno." });
  }
}
