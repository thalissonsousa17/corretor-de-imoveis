import type { NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: "CORRETOR" },
      include: {
        profile: {
          select: {
            plano: true,
            planoStatus: true,
            creci: true,
            whatsapp: true,
            slug: true,
          },
        },
        _count: {
          select: { imoveis: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      creci: user.profile?.creci || "N/A",
      whatsapp: user.profile?.whatsapp || "N/A",
      slug: user.profile?.slug || "",
      plano: user.profile?.plano || "GRATUITO",
      status: user.profile?.planoStatus || "INATIVO",
      imoveisCount: user._count.imoveis,
      createdAt: user.createdAt,
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export default authorize(handler, "ADMIN");
