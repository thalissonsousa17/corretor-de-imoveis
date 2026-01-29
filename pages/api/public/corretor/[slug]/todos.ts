import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

type ImovelComFotos = Prisma.ImovelGetPayload<{
  include: { fotos: true };
}>;

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const fileName = path.basename(url);
  return `/api/uploads/${fileName}`;
}

function absoluteUrl(req: NextApiRequest, p: string) {
  if (!p) return "";
  if (p.startsWith("http")) return p;

  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;

  return `${proto}://${host}${p}`;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug: String(slug) },
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
        fotoPrincipal: absoluteUrl(req, normalizeUrl(primeiraFotoUrl)),
        fotos: undefined,
      };
    });

    return res.status(200).json({
      corretor: {
        name: profile.slug,
        avatarUrl: absoluteUrl(req, normalizeUrl(profile.avatarUrl)),
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).end();
  }
}
