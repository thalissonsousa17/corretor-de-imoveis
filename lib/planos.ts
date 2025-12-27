import { PlanoTipo } from "@prisma/client";

export const LIMITE_IMOVEIS_POR_PLANO: Record<PlanoTipo, number> = {
  GRATUITO: 5,
  PRO: 50,
  START: 100,
  EXPERT: Infinity,
};
