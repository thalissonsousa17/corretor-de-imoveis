import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const normalizeUrl = (url: string | null) => {
  if (!url) return "";
  const fileName = url.split(/[\\/]/).pop();
  return `/api/uploads/${fileName}`;
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  if (typeof slug !== "string") return res.status(400).json({ message: "Slug inválido." });

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: { select: { name: true, email: true } } },
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
      take: 24,
    });

    const imoveis = imoveisRaw.map((imovel) => {
      const temFotos = imovel.fotos && imovel.fotos.length > 0;
      const urlOriginal = temFotos ? imovel.fotos[0].url : null;

      return {
        ...imovel,
        fotoPrincipal: normalizeUrl(urlOriginal),
        fotos: undefined,
      };
    });

    return res.status(200).json({
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        avatarUrl: normalizeUrl(profile.avatarUrl),
        whatsapp: profile.whatsapp,
        slug: profile.slug,
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}
