import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Método não permitido" });
    return;
  }

  const { priceId } = req.body as { priceId?: string };

  if (!priceId) {
    res.status(400).json({ error: "ID do preço é obrigatório." });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "Usuário não autenticado." });
    return;
  }

  const userId = req.user.id;

  const profile = await prisma.corretorProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    res.status(404).json({ error: "Perfil de corretor não encontrado." });
    return;
  }

  if (profile.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId);

    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      res.status(400).json({ error: "Assinatura sem item para atualizar." });
      return;
    }

    const updated = await stripe.subscriptions.update(profile.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "create_prorations",
      metadata: { userId },
    });

    res.status(200).json({
      upgraded: true,
      subscriptionId: updated.id,
    });
    return;
  }

  let stripeCustomerId = profile.stripeCustomerId;

  if (!stripeCustomerId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.stripeCustomerId) {
      stripeCustomerId = user.stripeCustomerId;
    } else {
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
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { userId } },
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/gerenciar-planos?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/gerenciar-planos?canceled=true`,
  });

  if (!session.url) {
    res.status(500).json({
      error: "Não foi possível criar a sessão de pagamento.",
    });
    return;
  }

  res.status(200).json({ url: session.url });
  return;
});
