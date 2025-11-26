import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export function mapPriceToPlano(priceId: string): "MENSAL" | "SEMESTRAL" | "ANUAL" {
  const map: Record<string, "MENSAL" | "SEMESTRAL" | "ANUAL"> = {
    [process.env.NEXT_PUBLIC_PRICE_MENSAL!]: "MENSAL",
    [process.env.NEXT_PUBLIC_PRICE_SEMESTRAL!]: "SEMESTRAL",
    [process.env.NEXT_PUBLIC_PRICE_ANUAL!]: "ANUAL",
  };

  return map[priceId] ?? "MENSAL";
}
