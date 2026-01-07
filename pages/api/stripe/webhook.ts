import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { mapPriceToPlano } from "@/lib/stripe";
import { PlanoTipo, PlanoStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export const config = {
  api: { bodyParser: false },
};

type SubscriptionWithDates = Stripe.Subscription & {
  current_period_end: number;
  start_date: number;
};

type InvoiceWithFields = Stripe.Invoice & {
  subscription: string | null;
  payment_intent: string | null;
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing signature");

  let event: Stripe.Event;

  try {
    const raw = await getRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "setup") {
      const setupIntentId = session.setup_intent as string;
      if (!setupIntentId) return res.json({ received: true });

      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

      const paymentMethodId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent.payment_method?.id;

      if (!paymentMethodId) return res.json({ received: true });

      const metadata = setupIntent.metadata ?? {};

      const userId = metadata["userId"];
      const priceId = metadata["priceId"];
      const subscriptionId = metadata["subscriptionId"];

      if (!userId || !priceId || !subscriptionId) {
        console.error("Metadata incompleta no setup_intent", metadata);
        return res.json({ received: true });
      }

      const profile = await prisma.corretorProfile.findUnique({
        where: { userId },
      });

      if (!profile || !profile.stripeCustomerId) {
        return res.json({ received: true });
      }

      await stripe.customers.update(profile.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data"],
      });

      const itemId = subscription.items.data[0]?.id;
      if (!itemId) return res.json({ received: true });

      await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: itemId, price: priceId }],
        proration_behavior: "always_invoice",
        payment_behavior: "error_if_incomplete",
      });

      return res.json({ received: true });
    }

    const email = session.customer_details?.email ?? session.customer_email;
    const name = session.customer_details?.name ?? "Novo Usuário";
    const stripeCustomerId = session.customer as string;

    if (!email) return res.json({ received: true });

    let user = await prisma.user.findUnique({ where: { email } });
    let senhaGerada: string | null = null;

    if (!user) {
      senhaGerada = crypto.randomBytes(5).toString("hex");

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: await bcrypt.hash(senhaGerada, 10),
          stripeCustomerId,
        },
      });

      await resend.emails.send({
        from: "ImobHub <noreply@contato.automatech.app.br>",
        to: email,
        subject: "Bem-vindo à ImobHub!",
        html: `
        <h2>Olá, ${name}</h2>
        <p>Seu acesso foi criado com sucesso!</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Senha:</b> ${senhaGerada}</p>
        <a href="http://imobhub.automatech.app.br/login"
          style="padding:12px 18px;background:#4f46e5;color:white;border-radius:6px;text-decoration:none;">
          Acessar painel
        </a>
      `,
      });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      console.error("Não foi possível obter o priceId");
      return res.json({ received: true });
    }

    const plano = mapPriceToPlano(priceId);

    const profile = await prisma.corretorProfile.upsert({
      where: { userId: user.id },
      update: {
        stripeCustomerId,
        plano,
        planoStatus: PlanoStatus.ATIVO,
      },
      create: {
        userId: user.id,
        stripeCustomerId,
        slug: `${name.toLowerCase().replace(/\s+/g, "-")}-${crypto.randomBytes(2).toString("hex")}`,
        plano,
        planoStatus: PlanoStatus.ATIVO,
      },
    });

    if (session.subscription) {
      await prisma.corretorProfile.update({
        where: { userId: user.id },
        data: {
          stripeSubscriptionId: session.subscription as string,
        },
      });
    }

    return res.json({ received: true });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as unknown as InvoiceWithFields;
    const email = invoice.customer_email;

    if (!email) return res.json({ received: true });

    const perfil = await prisma.corretorProfile.findFirst({
      where: { user: { email } },
    });

    if (!perfil) return res.json({ received: true });

    if (perfil.plano === PlanoTipo.GRATUITO && !perfil.stripeSubscriptionId) {
      return res.json({ received: true });
    }

    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      console.error(" Invoice sem subscriptionId");
      return res.json({ received: true });
    }

    const response = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });

    const subscription = response as unknown as SubscriptionWithDates;

    const paymentIntentId = invoice.payment_intent;
    let ultimos4: string | null = null;

    if (paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const paymentMethodId = paymentIntent.payment_method as string | null;

        if (paymentMethodId) {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
          if (paymentMethod.card) {
            ultimos4 = paymentMethod.card.last4;
          }
        }
      } catch (error) {
        console.error(" Erro ao buscar dados do cartão (Payment Intent/Method):", error);
      }
    }

    const item = subscription.items.data[0];
    const priceId = item?.price?.id;

    if (!priceId) {
      console.error(" PriceId não encontrado");
      return res.json({ received: true });
    }

    if (!subscription.current_period_end || !subscription.start_date) {
      console.error(" Dados de timestamp da assinatura ausentes");
      return res.json({ received: true });
    }

    await prisma.corretorProfile.updateMany({
      where: {
        OR: [
          { stripeSubscriptionId: subscription.id },
          { stripeCustomerId: subscription.customer as string },
        ],
      },

      data: {
        planoStatus: PlanoStatus.ATIVO,
        stripeSubscriptionId: subscription.id,
        ultimos4,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        assinaturaCriadaEm: new Date(subscription.start_date * 1000),
        ultimoPagamentoEm: new Date(),
      },
    });

    return res.json({ received: true });
  }

  if (event.type === "customer.subscription.updated") {
    type StripeSubscriptionWithPeriods = Stripe.Subscription & {
      current_period_end: number;
      start_date: number;
    };
    const subscription = event.data.object as unknown as StripeSubscriptionWithPeriods;

    const stripeCustomerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    const perfil = await prisma.corretorProfile.findFirst({
      where: {
        OR: [{ stripeSubscriptionId: subscription.id }, { stripeCustomerId }],
      },
    });

    if (!perfil) {
      console.error("Perfil não encontrado para subscription", subscription.id);
      return res.json({ received: true });
    }

    const currentPeriodEnd: number | null =
      "current_period_end" in subscription && typeof subscription.current_period_end === "number"
        ? subscription.current_period_end
        : null;

    const startDate: number | null =
      "start_date" in subscription && typeof subscription.start_date === "number"
        ? subscription.start_date
        : null;

    const item = subscription.items.data[0];
    const priceId = item?.price?.id;

    if (!priceId) {
      console.error("PriceId não encontrado na subscription", subscription.id);
      return res.json({ received: true });
    }

    const plano = mapPriceToPlano(priceId);

    await prisma.corretorProfile.update({
      where: {
        id: perfil.id,
      },
      data: {
        plano,
        planoStatus: "ATIVO",
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
        assinaturaCriadaEm: startDate ? new Date(startDate * 1000) : new Date(),
        ultimoPagamentoEm: new Date(),
      },
    });
  }

  return res.json({ received: true });
}
