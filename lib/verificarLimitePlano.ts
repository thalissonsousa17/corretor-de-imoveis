import { supabaseAdmin } from "@/lib/supabase";
import { LIMITES_POR_PLANO } from "@/lib/planos";
import type { PlanoTipo } from "@/lib/types";

type Recurso = "imoveis" | "leads" | "visitas" | "contratos" | "financeiro";

const TABELA_MAP: Record<Recurso, string> = {
  imoveis:    "Imovel",
  leads:      "Lead",
  visitas:    "Visita",
  contratos:  "Contrato",
  financeiro: "Comissao",
};

export async function verificarLimitePlano(
  corretorId: string,
  recurso: Recurso
): Promise<{ permitido: boolean; limite: number; total: number; plano: string; code: string }> {
  const { data: profile } = await supabaseAdmin
    .from("CorretorProfile")
    .select("plano")
    .eq("userId", corretorId)
    .maybeSingle();

  const plano = (profile?.plano ?? "GRATUITO") as PlanoTipo;
  const limite = LIMITES_POR_PLANO[plano]?.[recurso] ?? 1;

  if (limite === Infinity) {
    return { permitido: true, limite: Infinity, total: 0, plano, code: "" };
  }

  const tabela = TABELA_MAP[recurso];
  const { count } = await supabaseAdmin
    .from(tabela)
    .select("*", { count: "exact", head: true })
    .eq("corretorId", corretorId);

  const total = count ?? 0;
  const permitido = total < limite;

  return {
    permitido,
    limite,
    total,
    plano,
    code: permitido ? "" : "PLANO_LIMITE_ATINGIDO",
  };
}
