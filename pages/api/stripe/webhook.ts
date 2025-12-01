import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { stripe, mapPriceToPlano } from "@/lib/stripe";
import { PlanoTipo, PlanoStatus } from "@prisma/client";

export const config = {
  api: { bodyParser: false },
};

// 🛠️ TIPAGEM FINAL:
// Tipo customizado para garantir que os campos de data da assinatura sejam reconhecidos como 'number'.
type SubscriptionWithDates = Stripe.Subscription & {
  current_period_end: number;
  start_date: number;
};

// Tipo customizado para garantir que os campos da Invoice que dão erro de tipagem existam.
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

  // ============================================================
  // CHECKOUT SESSION COMPLETED
  // ============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email ?? session.customer_email;
    const name = session.customer_details?.name ?? "Novo Usuário";
    const stripeCustomerId = session.customer as string;

    if (!email) return res.json({ received: true });

    let user = await prisma.user.findUnique({ where: { email } });
    let senhaGerada = null;

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
        from: "ImobTECH <noreply@contato.automatech.app.br>",
        to: email,
        subject: "🎉 Bem-vindo à ImobTECH!",
        html: `
          <h2>Olá, ${name}</h2>
          <p>Seu acesso foi criado com sucesso!</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Senha:</b> ${senhaGerada}</p>
          <a href="http://localhost:3000/login" 
            style="padding:12px 18px;background:#4f46e5;color:white;border-radius:6px;text-decoration:none;">
            Acessar painel
          </a>
        `,
      });
    }

    // Obter o PRICE ID comprado
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      console.error("❌ Não foi possível obter o priceId");
      return res.json({ received: true });
    }

    const plano = mapPriceToPlano(priceId);

    // Criar / atualizar perfil
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

    // Salvar subscriptionId
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

  // ============================================================
  // INVOICE PAYMENT SUCCEEDED
  // ============================================================
  if (event.type === "invoice.payment_succeeded") {
    // Aplicamos o tipo customizado para ter acesso a subscription e payment_intent
    const invoice = event.data.object as unknown as InvoiceWithFields;
    const email = invoice.customer_email;

    if (!email) return res.json({ received: true });

    const perfil = await prisma.corretorProfile.findFirst({
      where: { user: { email } },
    });

    if (!perfil) return res.json({ received: true });

    // Plano gratuito sem Stripe → ignora
    if (perfil.plano === PlanoTipo.GRATUITO && !perfil.stripeSubscriptionId) {
      console.log("🟡 Usuário no gratuito sem Stripe. Ignorando.");
      return res.json({ received: true });
    }

    // CORREÇÃO 1: Resolve o erro 'A propriedade 'subscription' não existe no tipo 'Invoice'.'
    const subscriptionId = invoice.subscription; // Agora acessado diretamente do InvoiceWithFields

    if (!subscriptionId) {
      console.error("❌ Invoice sem subscriptionId");
      return res.json({ received: true });
    }

    // Buscar assinatura COMPLETA (nova API → subscription.data)
    const response = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });

    // CORREÇÃO 2: Usa o tipo customizado para resolver o erro 'current_period_end'
    const subscription = response as unknown as SubscriptionWithDates;

    // 🌟 CORREÇÃO 3: Lógica para buscar os últimos 4 dígitos do cartão (ultimos4)
    // paymentIntentId agora é const e vem do tipo InvoiceWithFields
    const paymentIntentId = invoice.payment_intent;
    let ultimos4: string | null = null;

    if (paymentIntentId) {
      try {
        // 1. Busca o Payment Intent para obter o ID do Payment Method
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const paymentMethodId = paymentIntent.payment_method as string | null;

        if (paymentMethodId) {
          // 2. Busca o Payment Method para obter os detalhes do cartão
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
          if (paymentMethod.card) {
            ultimos4 = paymentMethod.card.last4;
          }
        }
      } catch (error) {
        console.error("❌ Erro ao buscar dados do cartão (Payment Intent/Method):", error);
      }
    }
    // ----------------------------------------------------------------------

    const item = subscription.items.data[0];
    const priceId = item?.price?.id;

    if (!priceId) {
      console.error("❌ PriceId não encontrado");
      return res.json({ received: true });
    }

    const plano = mapPriceToPlano(priceId);

    // Verifique se os campos existem antes de usar
    if (!subscription.current_period_end || !subscription.start_date) {
      console.error("❌ Dados de timestamp da assinatura ausentes");
      return res.json({ received: true });
    }

    await prisma.corretorProfile.updateMany({
      where: { user: { email } },
      data: {
        plano,
        planoStatus: PlanoStatus.ATIVO,
        stripeSubscriptionId: subscription.id,
        ultimos4,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        assinaturaCriadaEm: new Date(subscription.start_date * 1000),
        ultimoPagamentoEm: new Date(),
      },
    });

    console.log("🟢 Plano atualizado:", plano);
    return res.json({ received: true });
  }

  return res.json({ received: true });
}
