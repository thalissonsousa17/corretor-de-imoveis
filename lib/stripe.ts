import Stripe from "stripe";
import type { PlanoTipo } from "@/lib/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export function mapPriceToPlano(priceId: string): PlanoTipo {
  const map: Record<string, PlanoTipo> = {
    [process.env.NEXT_PUBLIC_PRICE_START!]: "START",
    [process.env.NEXT_PUBLIC_PRICE_PRO!]: "PRO",
    [process.env.NEXT_PUBLIC_PRICE_EXPERT!]: "EXPERT",
    [process.env.NEXT_PUBLIC_PRICE_EXPERT_YEARLY!]: "EXPERT",
  };

  return map[priceId] ?? "GRATUITO";
}
