import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

/* --- A MESMA LÓGICA DO SEU [ID].TS --- */
function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Se já for uma URL completa externa, mantém
  if (url.startsWith("http")) return url;

  // Pega apenas o nome do arquivo (ex: 'foto-123.jpg')
  // Resolve o erro de imagem quebrada e 404
  const fileName = path.basename(url);

  // Retorna o caminho que passa pela API de leitura em tempo real
  return `/api/uploads/${fileName}`;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  if (typeof slug !== "string") {
    return res.status(400).json({ message: "Slug inválido." });
  }

  try {
    // 1. Busca o perfil do corretor
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Corretor não encontrado." });
    }

    // 2. Monta o filtro de busca
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

    // 3. Busca os imóveis (Exatamente como a estrutura do [id].ts funciona)
    const imoveisRaw = await prisma.imovel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        fotos: {
          orderBy: { ordem: "asc" },
          take: 1, // Capa para a listagem
        },
      },
      take: 24, // Limite para acabar com a lentidão extrema
    });

    // 4. APLICAÇÃO DA NORMALIZAÇÃO (O segredo do seu [id].ts)
    const imoveis = imoveisRaw.map((imovel) => {
      // Verificação segura para evitar 'Application Error'
      const primeiraFotoUrl = imovel.fotos && imovel.fotos.length > 0 ? imovel.fotos[0].url : null;

      return {
        ...imovel,
        // Injetamos a URL normalizada que a API de streaming entende
        fotoPrincipal: normalizeUrl(primeiraFotoUrl),
        // Normalizamos o array de fotos para manter o padrão
        fotos: imovel.fotos.map((f) => ({
          ...f,
          url: normalizeUrl(f.url),
        })),
      };
    });

    // 5. Retorno com dados do corretor também normalizados
    return res.status(200).json({
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        email: profile.user.email,
        creci: profile.creci,
        avatarUrl: normalizeUrl(profile.avatarUrl),
        bannerUrl: normalizeUrl(profile.bannerUrl),
        logoUrl: normalizeUrl(profile.logoUrl),
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
