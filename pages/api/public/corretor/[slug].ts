import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  if (typeof slug !== "string") return res.status(400).json({ message: "Slug inválido." });

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    const where: Prisma.ImovelWhereInput = {
      corretorId: profile.userId,
    };

    if (typeof filtro === "string") {
      switch (filtro.toUpperCase()) {
        case "VENDA":
          where.finalidade = "VENDA";
          where.status = "DISPONIVEL";
          break;
        case "ALUGUEL":
          where.finalidade = "ALUGUEL";
          where.status = "DISPONIVEL";
          break;
        case "VENDIDO":
          where.status = "VENDIDO";
          break;
        case "ALUGADO":
          where.status = "ALUGADO";
          break;
        case "INATIVO":
          where.status = "INATIVO";
          break;
      }
    }

    const imoveis = await prisma.imovel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        fotos: {
          orderBy: { ordem: "asc" },
          take: 1,
        },
      },
      take: 50,
    });

    res.json({
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        creci: profile.creci,
        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,
        logoUrl: profile.logoUrl,
        biografia: profile.biografia,
        instagram: profile.instagram,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        whatsapp: profile.whatsapp,
        slug: profile.slug,
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
}
