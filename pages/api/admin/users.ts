import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const { data: users } = await supabaseAdmin
      .from("User")
      .select("*, profile:CorretorProfile(plano,planoStatus,creci,whatsapp,slug)")
      .eq("role", "CORRETOR")
      .order("createdAt", { ascending: false });

    const userIds = (users ?? []).map((u: any) => u.id);
    const { data: imoveis } = userIds.length
      ? await supabaseAdmin.from("Imovel").select("corretorId").in("corretorId", userIds)
      : { data: [] };

    const imovelCountMap: Record<string, number> = {};
    for (const im of imoveis ?? []) {
      imovelCountMap[im.corretorId] = (imovelCountMap[im.corretorId] || 0) + 1;
    }

    const formattedUsers = (users ?? []).map((user: any) => {
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
