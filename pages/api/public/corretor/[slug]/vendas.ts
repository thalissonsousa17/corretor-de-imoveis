import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { resolveFotoUrl } from "@/lib/imageUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (typeof slug !== "string") return res.status(400).json({ message: "Slug inválido" });

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: true },
    });
    if (!profile) return res.status(404).json({ message: "Corretor não encontrado" });

    const imoveis = await prisma.imovel.findMany({
      where: {
        corretorId: profile.userId,
        finalidade: "VENDA",
        status: "DISPONIVEL",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        fotos: {
          orderBy: {
            ordem: "asc",
          },
          take: 1,
        },
      },
    });
    res.json({
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        creci: profile.creci,
        slug: profile.slug,
        avatarUrl: resolveFotoUrl(profile.avatarUrl),
        bannerUrl: resolveFotoUrl(profile.bannerUrl),
        whatsapp: profile.whatsapp,
        instagram: profile.instagram,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        logoUrl: resolveFotoUrl(profile.logoUrl),
      },
      imoveis: (imoveis || []).map(im => ({
        ...im,
        fotos: (im.fotos || []).map((f: any) => ({
          ...f,
          url: resolveFotoUrl(f.url)
        }))
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erro interno" });
  }
}
