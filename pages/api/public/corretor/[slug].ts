import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

function resolveFotoUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/api/uploads/")) return url;

  const fileName = path.basename(url);
  return `/api/uploads/${fileName}`;
}

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

    const imoveisRaw = await prisma.imovel.findMany({
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

    const imoveis = imoveisRaw.map((imovel) => {
      const capaRaw = imovel.fotos?.[0]?.url ?? null;

      return {
        ...imovel,

        fotoPrincipal: resolveFotoUrl(capaRaw),

        fotos:
          imovel.fotos?.map((f) => ({
            ...f,
            url: resolveFotoUrl(f.url),
          })) ?? [],
      };
    });

    res.json({
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        email: profile.user.email,
        creci: profile.creci,

        avatarUrl: resolveFotoUrl(profile.avatarUrl),
        bannerUrl: resolveFotoUrl(profile.bannerUrl),
        logoUrl: resolveFotoUrl(profile.logoUrl),

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
