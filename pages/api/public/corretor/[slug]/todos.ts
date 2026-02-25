import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";
import { resolveFotoUrl } from "@/lib/imageUtils";

type ImovelComFotos = Prisma.ImovelGetPayload<{
  include: { fotos: true };
}>;



export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug: String(slug) },
      include: { user: true },
    });

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    const imoveisRaw = (await prisma.imovel.findMany({
      where: {
        corretorId: profile.userId,
      },
      include: {
        fotos: {
          orderBy: { ordem: "asc" },
          take: 1,
        },
      },
      take: 24,
    })) as ImovelComFotos[];

    const imoveis = imoveisRaw.map((imovel) => {
      const primeiraFotoUrl = imovel.fotos.length > 0 ? imovel.fotos[0].url : null;

      console.log(`[LOG] Imóvel: ${imovel.titulo} | Foto Original: ${primeiraFotoUrl}`);

      return {
        ...imovel,
        fotoPrincipal: resolveFotoUrl(primeiraFotoUrl),
        fotos: undefined,
      };
    });

    return res.status(200).json({
      corretor: {
        name: profile.user?.name || profile.slug,
        avatarUrl: resolveFotoUrl(profile.avatarUrl),
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).end();
  }
}
