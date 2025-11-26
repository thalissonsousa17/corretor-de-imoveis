import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ message: "ID inválido" });

  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        fotos: {
          orderBy: {
            ordem: "asc",
          },
        },
        corretor: {
          include: {
            profile: true,
          },
        },
      },
    });
    if (!imovel) return res.status(404).json({ message: "Imóvel não encontrado" });

    const profile = imovel.corretor.profile;
    res.json({
      imovel,
      corretor: profile
        ? {
            name: imovel.corretor.name,
            creci: profile.creci,
            slug: profile.slug,
            avatarUel: profile.avatarUrl,
            logoUrl: profile.logoUrl,
            bannerUrl: profile.bannerUrl,
            whatsapp: profile.whatsapp,
            instagram: profile.instagram,
            facebook: profile.facebook,
            linkedin: profile.linkedin,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erro interno" });
  }
}
