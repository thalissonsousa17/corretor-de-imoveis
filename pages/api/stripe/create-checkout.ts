import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método não permitido" });
      return;
    }

    const { priceId, source } = req.body as {
      priceId?: string;
      source?: "landing" | "upgrade";
    };

    if (!priceId) {
      res.status(400).json({ error: "priceId é obrigatório" });
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      res.status(500).json({ error: "BASE_URL não configurada" });
      return;
    }

    let stripeCustomerId: string | undefined;
    let userId: string | undefined;

    if (req.user) {
      userId = req.user.id;

      const profile = await prisma.corretorProfile.findUnique({
        where: { userId },
      });

      if (profile?.stripeCustomerId) {
        stripeCustomerId = profile.stripeCustomerId;
      } else if (req.user.email) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId },
        });

        stripeCustomerId = customer.id;

        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        });

        await prisma.corretorProfile.update({
          where: { userId },
          data: { stripeCustomerId },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],

      metadata: {
        priceId,
        source: source ?? "landing",
        ...(userId && { userId }),
      },

      subscription_data: {
        metadata: {
          ...(userId && { userId }),
        },
      },

      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&src=${source ?? "landing"}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("STRIPE_CREATE_CHECKOUT_ERROR:", error);
    res.status(500).json({ error: "Erro ao iniciar checkout" });
  }
});
