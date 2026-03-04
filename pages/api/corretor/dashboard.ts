import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  if (req.method === "GET") {
    try {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
      const fim7dias = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).toISOString();
      const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1).toISOString();

      // ── Imóveis ──────────────────────────────────────────────────
      const { data: todosImoveis } = await supabaseAdmin
        .from("Imovel")
        .select("id,titulo,tipo,preco,status,createdAt")
        .eq("corretorId", userId)
        .order("createdAt", { ascending: false });

      const imovelList = todosImoveis ?? [];
      const totalImoveis = imovelList.length;
      const imovelDisponiveis = imovelList.filter((i) => i.status === "DISPONIVEL").length;
      const imovelVendido = imovelList.filter((i) => i.status === "VENDIDO").length;
      const imovelAlugado = imovelList.filter((i) => i.status === "ALUGADO").length;
      const imovelInativo = imovelList.filter((i) => i.status === "INATIVO").length;

      // Agrupa por tipo em JS
      const tiposMap: Record<string, number> = {};
      for (const im of imovelList) {
        if (im.tipo) tiposMap[im.tipo] = (tiposMap[im.tipo] ?? 0) + 1;
      }
      const graficoTipos = Object.entries(tiposMap).map(([tipo, quantidade]) => ({ tipo, quantidade }));
      const imoveisRecentes = imovelList.slice(0, 5);

      // ── Leads ────────────────────────────────────────────────────
      const { count: leadsNovos } = await supabaseAdmin
        .from("Lead")
        .select("*", { count: "exact", head: true })
        .eq("corretorId", userId)
        .eq("status", "NOVO");

      const { data: leadsRecentes } = await supabaseAdmin
        .from("Lead")
        .select("id,nome,email,whatsapp,imovelInteresse,createdAt")
        .eq("corretorId", userId)
        .eq("status", "NOVO")
        .order("createdAt", { ascending: false })
        .limit(5);

      // ── Visitas ──────────────────────────────────────────────────
      const { count: visitasHoje } = await supabaseAdmin
        .from("Visita")
        .select("*", { count: "exact", head: true })
        .eq("corretorId", userId)
        .in("status", ["AGENDADA", "CONFIRMADA"])
        .gte("dataHora", hoje)
        .lt("dataHora", amanha);

      const { count: visitas7dias } = await supabaseAdmin
        .from("Visita")
        .select("*", { count: "exact", head: true })
        .eq("corretorId", userId)
        .in("status", ["AGENDADA", "CONFIRMADA"])
        .gte("dataHora", agora.toISOString())
        .lte("dataHora", fim7dias);

      const { data: proximasVisitas } = await supabaseAdmin
        .from("Visita")
        .select("*, imovel:Imovel(id,titulo)")
        .eq("corretorId", userId)
        .in("status", ["AGENDADA", "CONFIRMADA"])
        .gte("dataHora", agora.toISOString())
        .order("dataHora", { ascending: true })
        .limit(5);

      // ── Contratos ────────────────────────────────────────────────
      const { count: contratosMes } = await supabaseAdmin
        .from("Contrato")
        .select("*", { count: "exact", head: true })
        .eq("corretorId", userId)
        .gte("createdAt", inicioMes);

      // ── Tickets ──────────────────────────────────────────────────
      const { count: ticketsAbertos } = await supabaseAdmin
        .from("TicketSuporte")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId)
        .in("status", ["ABERTO", "EM_ANDAMENTO"]);

      return res.status(200).json({
        stats: {
          total: totalImoveis,
          disponiveis: imovelDisponiveis,
          vendidos: imovelVendido,
          alugados: imovelAlugado,
          inativos: imovelInativo,
        },
        recentes: imoveisRecentes,
        graficoTipos,
        atividade: {
          leadsNovos: leadsNovos ?? 0,
          visitasHoje: visitasHoje ?? 0,
          visitas7dias: visitas7dias ?? 0,
          contratosMes: contratosMes ?? 0,
          ticketsAbertos: ticketsAbertos ?? 0,
        },
        proximasVisitas: proximasVisitas ?? [],
        leadsRecentes: leadsRecentes ?? [],
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      return res.status(500).json({ error: "Erro interno ao carregar o dashboard." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
});
