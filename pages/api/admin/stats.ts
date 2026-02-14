import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const totalCorretores = await prisma.user.count({
      where: { role: "CORRETOR" },
    });

    const planosAtivos = await prisma.corretorProfile.count({
      where: { planoStatus: "ATIVO" },
    });

    const proPlans = await prisma.corretorProfile.count({ where: { plano: "PRO", planoStatus: "ATIVO" } });
    const startPlans = await prisma.corretorProfile.count({ where: { plano: "START", planoStatus: "ATIVO" } });
    const expertPlans = await prisma.corretorProfile.count({ where: { plano: "EXPERT", planoStatus: "ATIVO" } });

    // Receita estimada (valores fictícios — ajuste conforme seus planos reais)
    const receita = (proPlans * 99) + (startPlans * 49) + (expertPlans * 149);

    const totalImoveis = await prisma.imovel.count();

    const recentes = await prisma.user.findMany({
      where: { role: "CORRETOR" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          select: { plano: true, planoStatus: true },
        },
      },
    });

    return res.status(200).json({
      totalCorretores,
      planosAtivos,
      receita,
      totalImoveis,
      breakdown: {
        pro: proPlans,
        start: startPlans,
        expert: expertPlans,
      },
      recentes,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export default authorize(handler, "ADMIN");
