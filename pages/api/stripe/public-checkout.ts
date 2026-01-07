import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { priceId } = req.body as { priceId?: string };

    if (!priceId) {
      return res.status(400).json({ error: "Plano inválido" });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      return res.status(500).json({ error: "BASE_URL não configurada" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/#planos`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("PUBLIC_CHECKOUT_ERROR:", err);
    return res.status(500).json({ error: "Erro ao iniciar checkout" });
  }
}
