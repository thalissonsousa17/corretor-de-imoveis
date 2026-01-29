import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";

/* --- O MESMO SEGREDO DO SEU [ID].TS --- */
function normalizeUrl(url: string | null | undefined, context: string = "desconhecido"): string {
  console.log(`[DEBUG NORMALIZE] (${context}) URL Original do Banco:`, url);

  if (!url) {
    console.log(`[DEBUG NORMALIZE] (${context}) URL vazia, retornando string vazia.`);
    return "";
  }

  if (url.startsWith("http")) {
    console.log(`[DEBUG NORMALIZE] (${context}) URL externa detectada:`, url);
    return url;
  }

  const fileName = path.basename(url);
  const finalUrl = `/api/uploads/${fileName}`;

  console.log(
    `[DEBUG NORMALIZE] (${context}) Nome extraído: ${fileName} -> URL Final: ${finalUrl}`
  );
  return finalUrl;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const { slug, filtro } = req.query;
  console.log(`\n--- [INICIO REQUISIÇÃO API TODOS] Slug: ${slug} | Filtro: ${filtro} ---`);

  if (typeof slug !== "string") {
    console.error("[ERRO] Slug inválido.");
    return res.status(400).json({ message: "Slug inválido." });
  }

  try {
    const profile = await prisma.corretorProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!profile) {
      console.error(`[ERRO] Perfil não encontrado para o slug: ${slug}`);
      return res.status(404).json({ message: "Corretor não encontrado." });
    }

    console.log(`[SUCESSO] Perfil encontrado: ${profile.user.name} (ID: ${profile.userId})`);

    const where: Prisma.ImovelWhereInput = {
      corretorId: profile.userId,
    };

    if (typeof filtro === "string") {
      const f = filtro.toUpperCase();
      if (f === "VENDA" || f === "ALUGUEL") {
        where.finalidade = f;
        where.status = "DISPONIVEL";
      } else if (f === "VENDIDO" || f === "ALUGADO") {
        where.status = f;
      }
    }

    console.log("[DEBUG QUERY] Buscando imóveis com filtro:", JSON.stringify(where));

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

    console.log(`[DEBUG DATA] Imóveis encontrados: ${imoveisRaw.length}`);

    const imoveis = imoveisRaw.map((imovel, index) => {
      const primeiraFoto = imovel.fotos && imovel.fotos.length > 0 ? imovel.fotos[0].url : null;

      return {
        ...imovel,
        fotoPrincipal: normalizeUrl(primeiraFoto, `Imóvel index ${index}`),
        fotos: undefined,
      };
    });

    const responseData = {
      corretor: {
        id: profile.userId,
        name: profile.user.name,
        avatarUrl: normalizeUrl(profile.avatarUrl, "Avatar Corretor"),
        whatsapp: profile.whatsapp,
        slug: profile.slug,
      },
      imoveis,
    };

    console.log("--- [FIM REQUISIÇÃO API TODOS] Resposta enviada com sucesso ---\n");
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("[ERRO FATAL API TODOS]:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}
