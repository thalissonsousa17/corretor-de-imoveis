import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: "2025-11-17.clover",
// });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type BillingAction = "SUBSCRIBE" | "UPGRADE_KEEP" | "UPGRADE_CHANGE";

type Body = {
  priceId?: string;
  action?: BillingAction;
};

type OkCheckout = {
  ok: true;
  flow: "CHECKOUT";
  url: string;
};

type OkUpgrade = {
  ok: true;
  flow: "UPGRADE_KEEP";
  subscriptionId: string;
};

type Err = {
  ok: false;
  error: string;
};

export default authorize(
  async (req: AuthApiRequest, res: NextApiResponse<OkCheckout | OkUpgrade | Err>) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Método não permitido" });
      }

      if (!req.user) {
        return res.status(401).json({ ok: false, error: "Usuário não autenticado" });
      }

      const { priceId, action } = req.body as Body;

      if (!priceId) {
        return res.status(400).json({ ok: false, error: "priceId é obrigatório" });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        return res.status(500).json({ ok: false, error: "NEXT_PUBLIC_BASE_URL não configurada" });
      }

      /**
       * Busca perfil do corretor
       */
      const profile = await prisma.corretorProfile.findUnique({
        where: { userId: req.user.id },
        select: {
          userId: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        },
      });

      if (!profile) {
        return res.status(404).json({ ok: false, error: "Perfil não encontrado" });
      }

      const billingAction: BillingAction =
        action ?? (profile.stripeSubscriptionId ? "UPGRADE_KEEP" : "SUBSCRIBE");

      let customerId = profile.stripeCustomerId ?? null;

      if (customerId) {
        try {
          await stripe.customers.retrieve(customerId);
        } catch (error: unknown) {
          if (error instanceof Stripe.errors.StripeError && error.code === "resource_missing") {
            customerId = null;
          } else {
            throw error;
          }
        }
      }

      if (!customerId) {
        if (!req.user.email) {
          return res.status(400).json({ ok: false, error: "Usuário sem e-mail" });
        }

        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId: req.user.id },
        });

        customerId = customer.id;

        await prisma.corretorProfile.update({
          where: { userId: req.user.id },
          data: { stripeCustomerId: customerId },
        });
      }

      if (billingAction === "SUBSCRIBE") {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: customerId,
          line_items: [{ price: priceId, quantity: 1 }],
          subscription_data: {
            metadata: { userId: req.user.id },
          },
          metadata: { userId: req.user.id },
          success_url: `${baseUrl}/checkout/success`,
          cancel_url: `${baseUrl}/checkout/cancel`,
        });

        if (!session.url) {
          return res.status(500).json({ ok: false, error: "URL do checkout não retornada" });
        }

        return res.status(200).json({
          ok: true,
          flow: "CHECKOUT",
          url: session.url,
        });
      }

      if (!profile.stripeSubscriptionId) {
        return res.status(400).json({
          ok: false,
          error: "Usuário não possui assinatura ativa",
        });
      }

      if (billingAction === "UPGRADE_KEEP") {
        const subscription = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId, {
          expand: ["items.data"],
        });

        const activeItem = subscription.items.data[0];
        if (!activeItem) {
          return res.status(400).json({
            ok: false,
            error: "Item da assinatura não encontrado",
          });
        }

        const updated = await stripe.subscriptions.update(profile.stripeSubscriptionId, {
          items: [
            {
              id: activeItem.id,
              price: priceId,
            },
          ],
          proration_behavior: "always_invoice",
          payment_behavior: "error_if_incomplete",
          metadata: { userId: req.user.id },
        });

        return res.status(200).json({
          ok: true,
          flow: "UPGRADE_KEEP",
          subscriptionId: updated.id,
        });
      }

      const setupSession = await stripe.checkout.sessions.create({
        mode: "setup",
        customer: customerId,
        setup_intent_data: {
          metadata: {
            userId: req.user.id,
            priceId,
            subscriptionId: profile.stripeSubscriptionId,
            flow: "UPGRADE_CHANGE",
          },
        },
        metadata: {
          userId: req.user.id,
          priceId,
          subscriptionId: profile.stripeSubscriptionId,
        },
        success_url: `${baseUrl}/checkout/success?setup=1`,
        cancel_url: `${baseUrl}/checkout/cancel?setup=1`,
      });

      if (!setupSession.url) {
        return res.status(500).json({
          ok: false,
          error: "URL do setup checkout não retornada",
        });
      }

      return res.status(200).json({
        ok: true,
        flow: "CHECKOUT",
        url: setupSession.url,
      });
    } catch (error) {
      console.error("BILLING_PLAN_ERROR:", error);
      const msg = error instanceof Error ? error.message : "Erro inesperado";
      return res.status(500).json({ ok: false, error: msg });
    }
  }
);
