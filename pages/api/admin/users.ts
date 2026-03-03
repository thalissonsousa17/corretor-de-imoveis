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
      },
      orderBy: { createdAt: "desc" },
    });

    // Contar imóveis por corretor separadamente (_count não é suportado no adapter Supabase)
    const userIds = (users as any[]).map((u: any) => u.id);
    const imoveis = userIds.length
      ? await prisma.imovel.findMany({ where: { corretorId: { in: userIds } }, select: { corretorId: true } })
      : [];
    const imovelCountMap: Record<string, number> = {};
    for (const im of imoveis as any[]) {
      imovelCountMap[im.corretorId] = (imovelCountMap[im.corretorId] || 0) + 1;
    }

    const formattedUsers = (users as any[]).map((user: any) => {
      // PostgREST pode retornar o perfil como objeto ou array (depende do FK único)
      const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        creci: profile?.creci || "N/A",
        whatsapp: profile?.whatsapp || "N/A",
        slug: profile?.slug || "",
        plano: profile?.plano || "GRATUITO",
        status: profile?.planoStatus || "INATIVO",
        imoveisCount: imovelCountMap[user.id] || 0,
        createdAt: user.createdAt,
      };
    });

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export default authorize(handler, "ADMIN");
