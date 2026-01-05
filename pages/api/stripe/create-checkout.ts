import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  try {
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

    let stripeCustomerId = profile.stripeCustomerId;

    if (!stripeCustomerId) {
      if (!req.user.email) {
        res.status(400).json({ error: "Usuário sem e-mail." });
        return;
      }

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      res.status(500).json({ error: "BASE_URL não configurada." });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/gerenciar-planos?success=true`,
      cancel_url: `${baseUrl}/dashboard/gerenciar-planos?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE_CHECKOUT_ERROR:", err);
    res.status(500).json({ error: "Erro ao conectar com o Stripe." });
  }
});
