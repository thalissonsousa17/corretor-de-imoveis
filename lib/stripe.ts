import Stripe from "stripe";
import { PlanoTipo } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export function mapPriceToPlano(priceId: string): PlanoTipo {
  const map: Record<string, PlanoTipo> = {
    [process.env.NEXT_PUBLIC_PRICE_START!]: PlanoTipo.START,
    [process.env.NEXT_PUBLIC_PRICE_PRO!]: PlanoTipo.PRO,
    [process.env.NEXT_PUBLIC_PRICE_EXPERT!]: PlanoTipo.EXPERT,
    [process.env.NEXT_PUBLIC_PRICE_EXPERT_YEARLY!]: PlanoTipo.EXPERT,
  };

  return map[priceId] ?? PlanoTipo.GRATUITO;
}
