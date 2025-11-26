import type { NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const { priceId, planoTipo } = req.body as {
      priceId?: string;
      planoTipo?: "GRATUITO" | "MENSAL" | "SEMESTRAL" | "ANUAL";
    };

    if (!priceId || !planoTipo) {
      return res.status(400).json({ error: "priceId e planoTipo são obrigatórios." });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const userId = req.user.id;

    // 1) Buscar perfil do corretor
    const profile = await prisma.corretorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: "Perfil de corretor não encontrado." });
    }

    // 2) Garantir stripeCustomerId (no profile e no user)
    let stripeCustomerId = profile.stripeCustomerId;

    if (!stripeCustomerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // se já tiver no User, reutiliza
      if (user?.stripeCustomerId) {
        stripeCustomerId = user.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: {
            userId,
          },
        });

        stripeCustomerId = customer.id;

        // salva nos dois lugares
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

    // 3) Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId,
          planoTipo,
        },
      },
      metadata: {
        userId,
        planoTipo,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/gerenciar-planos?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/gerenciar-planos?canceled=true`,
    });

    if (!session.url) {
      return res.status(500).json({ error: "Não foi possível criar a sessão de pagamento." });
    }

    return res.status(200).json({ url: session.url });
  } catch (error: unknown) {
    console.error("Erro ao criar sessão de checkout:", error);
    return res.status(500).json({ error: "Erro interno ao criar sessão de checkout." });
  }
});
