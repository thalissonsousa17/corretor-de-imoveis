import { NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { AuthApiRequest, authorize } from "../../../../lib/authMiddleware";

const handleGetCorretorImoveis = async (req: AuthApiRequest, res: NextApiResponse) => {
  const corretorId = req.user!.id;

  try {
    const imoveis = await prisma.imovel.findMany({
      where: { corretorId: corretorId },
      include: { fotos: true }, // Inclua as fotos para exibir no painel de gerenciamento
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(imoveis);
  } catch (error) {
    console.error("Erro ao buscar imóveis do corretor:", error);
    return res.status(500).json({ message: "Erro interno ao buscar seus imóveis." });
  }
};

export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return authorize(handleGetCorretorImoveis, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido." });
}
