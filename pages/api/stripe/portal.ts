import type { NextApiResponse } from "next";
import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: "2025-11-17.clover",
// });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default authorize(async (req: AuthApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        error: "Este usuário não possui cliente Stripe cadastrado.",
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/corretor/assinatura`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error("Erro ao gerar portal Stripe:", error);
    return res.status(500).json({ error: "Erro interno ao criar portal." });
  }
});
