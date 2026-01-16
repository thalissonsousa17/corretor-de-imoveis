import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: "2025-11-17.clover",
// });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
type Body = {
  priceId?: string;
};

type Ok = {
  ok: true;
  url: string;
};

type Err = {
  ok: false;
  error: string;
};

export default authorize(async (req: AuthApiRequest, res: NextApiResponse<Ok | Err>) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Método não permitido" });
    }

    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Usuário não autenticado" });
    }

    const { priceId } = req.body as Body;

    if (!priceId) {
      return res.status(400).json({ ok: false, error: "priceId é obrigatório" });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return res.status(500).json({ ok: false, error: "NEXT_PUBLIC_BASE_URL não configurada" });
    }

    const profile = await prisma.corretorProfile.findUnique({
      where: { userId: req.user.id },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!profile?.stripeCustomerId || !profile.stripeSubscriptionId) {
      return res.status(400).json({
        ok: false,
        error: "Usuário não possui assinatura ativa",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: profile.stripeCustomerId,
      payment_method_types: ["card"],

      setup_intent_data: {
        metadata: {
          userId: req.user.id,
          priceId,
          subscriptionId: profile.stripeSubscriptionId,
          flow: "UPGRADE_CHANGE_CARD",
        },
      },

      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    if (!session.url) {
      return res.status(500).json({ ok: false, error: "URL do checkout não retornada" });
    }

    return res.status(200).json({
      ok: true,
      url: session.url,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro inesperado";
    return res.status(500).json({ ok: false, error: msg });
  }
});
