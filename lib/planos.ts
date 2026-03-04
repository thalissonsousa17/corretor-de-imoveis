import { PlanoTipo } from "@/lib/types";

export const LIMITE_IMOVEIS_POR_PLANO: Record<PlanoTipo, number> = {
  GRATUITO: 5,
  PRO: 50,
  START: 100,
  EXPERT: Infinity,
};

export const LIMITES_POR_PLANO: Record<PlanoTipo, Record<string, number>> = {
  GRATUITO: { imoveis: 5, leads: 1, visitas: 1, contratos: 1, financeiro: 1 },
  PRO:      { imoveis: 50, leads: Infinity, visitas: Infinity, contratos: Infinity, financeiro: Infinity },
  START:    { imoveis: 100, leads: Infinity, visitas: Infinity, contratos: Infinity, financeiro: Infinity },
  EXPERT:   { imoveis: Infinity, leads: Infinity, visitas: Infinity, contratos: Infinity, financeiro: Infinity },
};
