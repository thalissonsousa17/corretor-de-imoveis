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

    const [
      { data: imoveis },
      { data: logAcessos },
      { data: logTokens },
    ] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("Imovel").select("corretorId").in("corretorId", userIds)
        : Promise.resolve({ data: [] }),
      userIds.length
        ? supabaseAdmin.from("LogAcesso").select("userId,loginAt,logoutAt,durationMinutes").in("userId", userIds).order("loginAt", { ascending: false })
        : Promise.resolve({ data: [] }),
      userIds.length
        ? supabaseAdmin.from("LogToken").select("userId,inputTokens,outputTokens,totalTokens,custo,createdAt").in("userId", userIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Build maps
    const imovelCountMap: Record<string, number> = {};
    for (const im of imoveis ?? []) {
      imovelCountMap[im.corretorId] = (imovelCountMap[im.corretorId] || 0) + 1;
    }

    // Last login and total time per user
    const lastLoginMap: Record<string, string> = {};
    const totalMinutesMap: Record<string, number> = {};
    for (const log of logAcessos ?? []) {
      if (!lastLoginMap[log.userId]) lastLoginMap[log.userId] = log.loginAt;
      totalMinutesMap[log.userId] = (totalMinutesMap[log.userId] || 0) + (log.durationMinutes ?? 0);
    }

    // Token totals per user
    const tokenMap: Record<string, { inputTokens: number; outputTokens: number; totalTokens: number; custo: number }> = {};
    for (const t of logTokens ?? []) {
      if (!tokenMap[t.userId]) tokenMap[t.userId] = { inputTokens: 0, outputTokens: 0, totalTokens: 0, custo: 0 };
      tokenMap[t.userId].inputTokens += t.inputTokens;
      tokenMap[t.userId].outputTokens += t.outputTokens;
      tokenMap[t.userId].totalTokens += t.totalTokens;
      tokenMap[t.userId].custo += Number(t.custo);
    }

    const formattedUsers = (users ?? []).map((user: any) => {
      const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
      const tokens = tokenMap[user.id] ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0, custo: 0 };
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
        ultimoLogin: lastLoginMap[user.id] ?? null,
        tempoTotalMinutos: totalMinutesMap[user.id] ?? 0,
        inputTokens: tokens.inputTokens,
        outputTokens: tokens.outputTokens,
        totalTokens: tokens.totalTokens,
        custoTotal: tokens.custo,
      };
    });

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export default authorize(handler, "ADMIN");
