// pages/api/users/me/imoveis.ts

import { NextApiResponse } from "next";
// Ajuste o caminho para o seu arquivo prisma.ts se for diferente
import { prisma } from "../../../../lib/prisma";
// Ajuste o caminho para o seu arquivo authMiddleware.ts se for diferente
import { AuthApiRequest, authorize } from "../../../../lib/authMiddleware";

// Handler para buscar SOMENTE os imóveis do corretor logado
const handleGetCorretorImoveis = async (req: AuthApiRequest, res: NextApiResponse) => {
  // req.user! é garantido pelo authorize('CORRETOR')
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

// Função principal que roteia a requisição
export default function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Protege a rota: só pode acessar quem for CORRETOR
    return authorize(handleGetCorretorImoveis, "CORRETOR")(req, res);
  }

  return res.status(405).json({ message: "Método não permitido." });
}
