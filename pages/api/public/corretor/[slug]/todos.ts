import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

/* --- O MESMO SEGREDO DO SEU [ID].TS --- */
function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Se já for uma URL completa externa, mantém
  if (url.startsWith("http")) return url;

  // IMPORTANTE: Pega apenas o nome do arquivo final (ex: 'foto.jpg')
  // Isso remove caminhos de disco como 'C:\projects\' ou '/uploads/' que causam o 404
  const fileName = path.basename(url);

  // Retorna o caminho que obriga o navegador a usar sua API de streaming rápida
  return `/api/uploads/${fileName}`;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;

  if (typeof slug !== "string") {
    return res.status(400).json({ message: "Slug inválido." });
  }

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!profile) return res.status(404).json({ message: "Corretor não encontrado." });

    const where: Prisma.ImovelWhereInput = {
      corretorId: profile.userId,
    };

    // Filtros de finalidade
    if (typeof filtro === "string") {
      const f = filtro.toUpperCase();
      if (f === "VENDA" || f === "ALUGUEL") {
        where.finalidade = f;
        where.status = "DISPONIVEL";
      } else if (f === "VENDIDO" || f === "ALUGADO") {
        where.status = f;
      }
    }

    // Busca os imóveis com a tipagem correta para evitar erros no VS Code
    const imoveisRaw = await prisma.imovel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        fotos: {
          orderBy: { ordem: "asc" },
          take: 1, // Só precisamos de 1 foto para a capa da listagem
        },
      },
      take: 24, // Limite para manter a velocidade do carregamento
    });

    // MAPEAMENTO PARA RESOLVER O 404 E A LENTIDÃO
    const imoveis = imoveisRaw.map((imovel) => {
      const primeiraFoto = imovel.fotos && imovel.fotos.length > 0 ? imovel.fotos[0].url : null;

      return {
        ...imovel,
        // Injetamos a URL normalizada que sua VPS consegue ler em tempo real
        fotoPrincipal: normalizeUrl(primeiraFoto),
        // Removemos o campo 'fotos' original para o JSON ficar leve (fim da lentidão)
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
    console.error("Erro na API pública:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}
