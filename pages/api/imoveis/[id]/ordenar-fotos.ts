// pages/api/imoveis/[id]/ordenar-fotos.ts
import prisma from "@/lib/prisma";
import { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

interface FotoOrdenada {
  id: string;
  ordem: number;
}

async function handle(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { id: imovelId } = req.query;
  const { fotos } = req.body as { fotos: FotoOrdenada[] };

  if (!imovelId || typeof imovelId !== "string") {
    return res.status(400).json({ message: "Imóvel inválido" });
  }

  if (!Array.isArray(fotos)) {
    return res.status(400).json({ message: "Payload inválido" });
  }

  const fotosValidas = fotos.filter((f): f is FotoOrdenada => !!f.id);

  if (fotosValidas.length === 0) {
    return res.status(200).json({ message: "Nenhuma foto válida para atualizar" });
  }

  const primeiraFoto = fotosValidas[0];

  const updates = [
    prisma.foto.updateMany({
      where: { imovelId },
      data: { principal: false },
    }),

    ...fotosValidas.map((item) =>
      prisma.foto.update({
        where: { id: item.id },
        data: { ordem: item.ordem },
      })
    ),

    prisma.foto.update({
      where: { id: primeiraFoto.id },
      data: { principal: true },
    }),
  ];

  await prisma.$transaction(updates);

  return res.status(200).json({ message: "Ordem (e foto principal) atualizada com sucesso!" });
}

export default authorize(handle, "CORRETOR");
