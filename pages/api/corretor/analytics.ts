import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const corretorId = req.user!.id;

  try {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
    const inicio30d = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: imoveisDoCorretor } = await supabaseAdmin
      .from("Imovel")
      .select("id,titulo")
      .eq("corretorId", corretorId);

    const imovelIds = (imoveisDoCorretor ?? []).map((i) => i.id);

    if (imovelIds.length === 0) {
      return res.status(200).json({
        viewsMes: 0,
        viewsTotal: 0,
        viewsDiarias: [],
        topImoveis: [],
      });
    }

    const { count: viewsMes } = await supabaseAdmin
      .from("ImovelView")
      .select("*", { count: "exact", head: true })
      .in("imovelId", imovelIds)
      .gte("createdAt", inicioMes);

    const { count: viewsTotal } = await supabaseAdmin
      .from("ImovelView")
      .select("*", { count: "exact", head: true })
      .in("imovelId", imovelIds);

    const { data: viewsRaw } = await supabaseAdmin
      .from("ImovelView")
      .select("createdAt")
      .in("imovelId", imovelIds)
      .gte("createdAt", inicio30d)
      .order("createdAt", { ascending: true });

    // Agrupar por dia
    const viewsPorDia: Record<string, number> = {};
    for (let d = 0; d < 30; d++) {
      const date = new Date(new Date(inicio30d).getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      viewsPorDia[key] = 0;
    }
    for (const v of viewsRaw ?? []) {
      const key = (v.createdAt as string).slice(0, 10);
      if (viewsPorDia[key] !== undefined) {
        viewsPorDia[key]++;
      }
    }
    const viewsDiarias = Object.entries(viewsPorDia).map(([data, count]) => ({
      data,
      views: count,
    }));

    // Top 5 imoveis por views (este mes) — agrupar em JS
    const { data: viewsMesRaw } = await supabaseAdmin
      .from("ImovelView")
      .select("imovelId")
      .in("imovelId", imovelIds)
      .gte("createdAt", inicioMes);

    const countPerImovel: Record<string, number> = {};
    for (const v of viewsMesRaw ?? []) {
      countPerImovel[v.imovelId] = (countPerImovel[v.imovelId] ?? 0) + 1;
    }

    const titulosMap = new Map((imoveisDoCorretor ?? []).map((i) => [i.id, i.titulo]));
    const topImoveis = Object.entries(countPerImovel)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([imovelId, views]) => ({
        imovelId,
        titulo: titulosMap.get(imovelId) || "Imovel",
        views,
      }));

    return res.status(200).json({
      viewsMes: viewsMes ?? 0,
      viewsTotal: viewsTotal ?? 0,
      viewsDiarias,
      topImoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return res.status(500).json({ message: "Erro interno." });
  }
}

export default authorize(handler);
