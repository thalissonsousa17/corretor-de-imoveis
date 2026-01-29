import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

// Definindo o tipo esperado para evitar erro de linting
type ImovelComFotos = Prisma.ImovelGetPayload<{
  include: { fotos: true };
}>;

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const fileName = path.basename(url);
  // Força a rota da API porque o acesso direto via /uploads/ dá 404
  return `/api/uploads/${fileName}`;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug: String(slug) },
    });

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    // Busca com a tipagem correta que o ESLint exige
    const imoveisRaw = (await prisma.imovel.findMany({
      where: {
        corretorId: profile.userId,
        // Adicione aqui a lógica do filtro se necessário
      },
      include: {
        fotos: {
          orderBy: { ordem: "asc" },
          take: 1,
        },
      },
      take: 24,
    })) as ImovelComFotos[]; // Cast correto para o TS parar de reclamar

    const imoveis = imoveisRaw.map((imovel) => {
      // Agora o TS sabe que 'fotos' existe!
      const primeiraFotoUrl = imovel.fotos.length > 0 ? imovel.fotos[0].url : null;

      // LOG PARA DIAGNÓSTICO REAL
      console.log(`[LOG] Imóvel: ${imovel.titulo} | Foto Original: ${primeiraFotoUrl}`);

      return {
        ...imovel,
        // A mágica que mata o 404
        fotoPrincipal: normalizeUrl(primeiraFotoUrl),
        fotos: undefined,
      };
    });

    return res.status(200).json({
      corretor: {
        name: profile.slug, // ou profile.user.name se tiver o include
        avatarUrl: normalizeUrl(profile.avatarUrl),
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).end();
  }
}
