import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

type PaymentChoice = "KEEP_CARD" | "CHANGE_CARD";

type Body = {
  priceId?: string;
  paymentChoice?: PaymentChoice;
};

type OkKeepCard = {
  ok: true;
  flow: "KEEP_CARD";
  upgraded: true;
  subscriptionId: string;
};

type OkCheckout = {
  ok: true;
  flow: "CHECKOUT";
  url: string;
};

type Err = {
  ok: false;
  error: string;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default authorize(
  async (req: AuthApiRequest, res: NextApiResponse<OkKeepCard | OkCheckout | Err>) => {
    try {
      if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
      }

      if (req.method !== "POST") {
        res.status(405).json({ ok: false, error: "Método não permitido" });
        return;
      }

      const { priceId, paymentChoice } = (req.body ?? {}) as Body;

      if (!priceId) {
        res.status(400).json({ ok: false, error: "priceId é obrigatório" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ ok: false, error: "Usuário não autenticado" });
        return;
      }

      const userId = req.user.id;
      const choice: PaymentChoice = paymentChoice ?? "KEEP_CARD";

      const profile = await prisma.corretorProfile.findUnique({
        where: { userId },
        select: {
          userId: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        },
      });

      if (!profile) {
        res.status(404).json({ ok: false, error: "Perfil de corretor não encontrado" });
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        res.status(500).json({ ok: false, error: "NEXT_PUBLIC_BASE_URL não configurada" });
        return;
      }

      // Garantir customerId
      let customerId = profile.stripeCustomerId ?? null;

      if (!customerId) {
        if (!req.user.email) {
          res.status(400).json({ ok: false, error: "Usuário sem e-mail" });
          return;
        }

        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId },
        });

        customerId = customer.id;

        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });

        await prisma.corretorProfile.update({
          where: { userId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Verificar assinatura existente
      const subscriptionId = profile.stripeSubscriptionId ?? null;

      if (!subscriptionId) {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: customerId!,
          line_items: [{ price: priceId, quantity: 1 }],
          subscription_data: {
            metadata: { userId },
          },
          metadata: { userId },
          success_url: `${baseUrl}/checkout/success`,
          cancel_url: `${baseUrl}/checkout/cancel`,
        });

        if (!session.url) {
          res.status(500).json({ ok: false, error: "URL do checkout não retornada" });
          return;
        }

        res.status(200).json({ ok: true, flow: "CHECKOUT", url: session.url });
        return;
      }

      // =========================

      if (choice === "KEEP_CARD") {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["items.data"],
        });

        const activeItem = subscription.items.data.find(
          (item) => item.price?.recurring?.interval === "month"
        );

        if (!activeItem) {
          return res.status(400).json({
            ok: false,
            error: "Item ativo da assinatura não encontrado",
          });
        }

        const updated = await stripe.subscriptions.update(subscriptionId, {
          items: [
            {
              id: activeItem.id,
              price: priceId,
            },
          ],
          proration_behavior: "always_invoice",
          payment_behavior: "error_if_incomplete",
          metadata: { userId },
        });

        return res.status(200).json({
          ok: true,
          flow: "KEEP_CARD",
          upgraded: true,
          subscriptionId: updated.id,
        });
      }

      // =========================

      const setupSession = await stripe.checkout.sessions.create({
        mode: "setup",
        customer: customerId!,
        setup_intent_data: {
          metadata: {
            userId,
            priceId,
            subscriptionId,
          },
        },
        metadata: {
          userId,
          priceId,
          subscriptionId,
          flow: "CHANGE_CARD",
        },
        success_url: `${baseUrl}/checkout/success?setup=1`,
        cancel_url: `${baseUrl}/checkout/cancel?setup=1`,
      });

      if (!setupSession.url) {
        res.status(500).json({ ok: false, error: "URL do setup checkout não retornada" });
        return;
      }

      res.status(200).json({ ok: true, flow: "CHECKOUT", url: setupSession.url });
    } catch (e) {
      console.error("UPGRADE_PLAN_ERROR:", e);
      const msg = e instanceof Error ? e.message : "Erro inesperado";
      res.status(500).json({ ok: false, error: msg });
    }
  }
);
