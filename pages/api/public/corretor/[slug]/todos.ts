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

  if (typeof slug !== "string") {
    return res.status(400).json({ message: "Slug inválido." });
  }

  try {
    // 2. Busca o perfil do corretor
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({ message: "Corretor não encontrado." });
    }

    // 3. Monta o filtro de busca de imóveis
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

    // 4. Busca os imóveis no banco
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

    const imoveis = imoveisRaw.map((imovel) => ({
      ...imovel,
      fotos: imovel.fotos.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    }));

    // 6. Retorno formatado e com URLs funcionais
    return res.status(200).json({
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        email: profile.user.email,
        creci: profile.creci,
        avatarUrl: normalizeUrl(profile.avatarUrl),
        bannerUrl: normalizeUrl(profile.bannerUrl),
        logoUrl: normalizeUrl(profile.logoUrl),
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
    console.error("Erro na API pública (todos):", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
