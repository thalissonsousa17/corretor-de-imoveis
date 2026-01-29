import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

/* --- O MESMO SEGREDO DO [ID].TS --- */
function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Se já for uma URL completa externa, mantém
  if (url.startsWith("http")) return url;

  // Pega apenas o nome do arquivo (ex: 'foto-123.jpg')
  // Isso resolve o problema de caminhos quebrados no banco
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
    // 1. Busca o perfil do corretor (usando select para ser mais rápido)
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

    // 3. Busca os imóveis (usando include fotos como no [id].ts)
    const imoveisRaw = await prisma.imovel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        fotos: {
          orderBy: { ordem: "asc" },
          take: 1, // Para a listagem, apenas a capa
        },
      },
      take: 24, // Limite para garantir performance
    });

    // 4. APLICAÇÃO DA NORMALIZAÇÃO (Igual ao seu [id].ts)
    const imoveis = imoveisRaw.map((imovel) => ({
      ...imovel,
      // Criamos a propriedade fotoPrincipal para o frontend usar com segurança
      fotoPrincipal: imovel.fotos.length > 0 ? normalizeUrl(imovel.fotos[0].url) : null,
      // Também normalizamos o array de fotos caso o frontend precise
      fotos: imovel.fotos.map((f) => ({
        ...f,
        url: normalizeUrl(f.url),
      })),
    }));

    // 5. Retorno formatado com URLs dinâmicas
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
        instagram: profile.instagram,
        slug: profile.slug,
      },
      imoveis,
    });
  } catch (error) {
    console.error("Erro na API pública (todos):", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
