import type { NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Usuário não autenticado." });
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido." });

  try {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
    const fim7dias = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).toISOString();
    const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1).toISOString();
    const inicio8sem = new Date(agora.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
    const inicio6mes = new Date(agora.getFullYear(), agora.getMonth() - 5, 1);

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

    // Leads por semana (últimas 8 semanas)
    const { data: leadsSemanaisRaw } = await supabaseAdmin
      .from("Lead")
      .select("createdAt")
      .eq("corretorId", userId)
      .gte("createdAt", inicio8sem.toISOString());

    const leadsSemanais = Array.from({ length: 8 }, (_, i) => {
      const w = 7 - i;
      const start = new Date(agora.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
      const end = new Date(agora.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const count = (leadsSemanaisRaw ?? []).filter((d: any) => {
        const dt = new Date(d.createdAt);
        return dt >= start && dt < end;
      }).length;
      return {
        semana: `${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")}`,
        leads: count,
      };
    });

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

    // Visitas por semana (últimas 8 semanas)
    const { data: visitasSemanaisRaw } = await supabaseAdmin
      .from("Visita")
      .select("dataHora")
      .eq("corretorId", userId)
      .gte("dataHora", inicio8sem.toISOString());

    const visitasSemanais = Array.from({ length: 8 }, (_, i) => {
      const w = 7 - i;
      const start = new Date(agora.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
      const end = new Date(agora.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const count = (visitasSemanaisRaw ?? []).filter((d: any) => {
        const dt = new Date(d.dataHora);
        return dt >= start && dt < end;
      }).length;
      return {
        semana: `${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")}`,
        visitas: count,
      };
    });

    // ── Contratos ────────────────────────────────────────────────
    const { count: contratosMes } = await supabaseAdmin
      .from("Contrato")
      .select("*", { count: "exact", head: true })
      .eq("corretorId", userId)
      .gte("createdAt", inicioMes);

    const { data: contratosRaw } = await supabaseAdmin
      .from("Contrato")
      .select("createdAt")
      .eq("corretorId", userId)
      .gte("createdAt", inicio6mes.toISOString());

    const contratosPorMes = Array.from({ length: 6 }, (_, i) => {
      const m = 5 - i;
      const mesDate = new Date(agora.getFullYear(), agora.getMonth() - m, 1);
      const count = (contratosRaw ?? []).filter((d: any) => {
        const dt = new Date(d.createdAt);
        return dt.getFullYear() === mesDate.getFullYear() && dt.getMonth() === mesDate.getMonth();
      }).length;
      return {
        mes: `${MESES[mesDate.getMonth()]}/${mesDate.getFullYear().toString().slice(2)}`,
        contratos: count,
      };
    });

    // ── Tickets ──────────────────────────────────────────────────
    const { count: ticketsAbertos } = await supabaseAdmin
      .from("TicketSuporte")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
      .in("status", ["ABERTO", "EM_ANDAMENTO"]);

    // ── Financeiro: Comissões por mês (últimos 6 meses) ──────────
    const { data: comissoesRaw } = await supabaseAdmin
      .from("Comissao")
      .select("valor,createdAt")
      .eq("corretorId", userId)
      .gte("createdAt", inicio6mes.toISOString());

    const financeiroPorMes = Array.from({ length: 6 }, (_, i) => {
      const m = 5 - i;
      const mesDate = new Date(agora.getFullYear(), agora.getMonth() - m, 1);
      const total = (comissoesRaw ?? [])
        .filter((d: any) => {
          const dt = new Date(d.createdAt);
          return dt.getFullYear() === mesDate.getFullYear() && dt.getMonth() === mesDate.getMonth();
        })
        .reduce((sum: number, d: any) => sum + (Number(d.valor) || 0), 0);
      return {
        mes: `${MESES[mesDate.getMonth()]}/${mesDate.getFullYear().toString().slice(2)}`,
        valor: total,
      };
    });

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
      leadsSemanais,
      visitasSemanais,
      contratosPorMes,
      financeiroPorMes,
    });
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    return res.status(500).json({ error: "Erro interno ao carregar o dashboard." });
  }
});
