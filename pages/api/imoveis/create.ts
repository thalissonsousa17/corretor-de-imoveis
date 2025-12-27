import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { LIMITE_IMOVEIS_POR_PLANO } from "@/lib/planos";
import { getSession } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const profile = await prisma.corretorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return res.status(403).json({ error: "Perfil não encontrado" });
    }

    if (profile.planoStatus === "EXPIRADO") {
      await prisma.corretorProfile.update({
        where: { id: profile.id },
        data: {
          plano: "GRATUITO",
          planoStatus: "ATIVO",
          planoCanceladoEm: new Date(),
        },
      });
    }

    const totalImoveis = await prisma.imovel.count({
      where: { corretorId: session.userId },
    });

    const limite = LIMITE_IMOVEIS_POR_PLANO[profile.plano];

    if (limite !== Infinity && totalImoveis >= limite) {
      return res.status(403).json({
        error: "Limite do plano atingido. Faça upgrade para continuar.",
        code: "PLANO_LIMITE_ATINGIDO",
      });
    }

    const imovel = await prisma.imovel.create({
      data: {
        ...req.body,
        corretorId: session.userId,
      },
    });

    return res.status(201).json(imovel);
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
