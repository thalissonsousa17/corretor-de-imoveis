import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const [
      { count: totalCorretores },
      { count: planosAtivos },
      { count: proPlans },
      { count: startPlans },
      { count: expertPlans },
      { count: totalImoveis },
      { data: recentesRaw },
    ] = await Promise.all([
      supabaseAdmin.from("User").select("*", { count: "exact", head: true }).eq("role", "CORRETOR"),
      supabaseAdmin.from("CorretorProfile").select("*", { count: "exact", head: true }).eq("planoStatus", "ATIVO"),
      supabaseAdmin.from("CorretorProfile").select("*", { count: "exact", head: true }).eq("plano", "PRO").eq("planoStatus", "ATIVO"),
      supabaseAdmin.from("CorretorProfile").select("*", { count: "exact", head: true }).eq("plano", "START").eq("planoStatus", "ATIVO"),
      supabaseAdmin.from("CorretorProfile").select("*", { count: "exact", head: true }).eq("plano", "EXPERT").eq("planoStatus", "ATIVO"),
      supabaseAdmin.from("Imovel").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("User")
        .select("id,name,email,createdAt,profile:CorretorProfile(plano,planoStatus)")
        .eq("role", "CORRETOR")
        .order("createdAt", { ascending: false })
        .limit(5),
    ]);

    // Receita estimada (valores fictícios — ajuste conforme seus planos reais)
    const receita = ((proPlans ?? 0) * 99) + ((startPlans ?? 0) * 49) + ((expertPlans ?? 0) * 149);

    return res.status(200).json({
      totalCorretores: totalCorretores ?? 0,
      planosAtivos: planosAtivos ?? 0,
      receita,
      totalImoveis: totalImoveis ?? 0,
      breakdown: {
        pro: proPlans ?? 0,
        start: startPlans ?? 0,
        expert: expertPlans ?? 0,
      },
      recentes: recentesRaw ?? [],
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}

export default authorize(handler, "ADMIN");
