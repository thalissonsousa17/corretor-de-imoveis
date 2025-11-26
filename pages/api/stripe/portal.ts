import type { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover", // mesma versão usada no webhook.ts
});

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    // Buscar o perfil do corretor
    const profile = await prisma.corretorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: "Perfil não encontrado." });
    }

    const stripeCustomerId = profile.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(400).json({
        error: "Este usuário ainda não possui um cliente Stripe cadastrado.",
      });
    }

    // Criar sessão do portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/corretor/assinatura`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error: unknown) {
    console.error("Erro ao gerar portal Stripe:", error);
    return res.status(500).json({ error: "Erro interno ao criar portal." });
  }
});
