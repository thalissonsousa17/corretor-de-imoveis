import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { stripe, mapPriceToPlano } from "@/lib/stripe";

export const config = {
  api: { bodyParser: false },
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

  const signature = req.headers["stripe-signature"] as string;
  if (!signature) return res.status(400).send("Missing signature");

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(400).send(`Webhook error: ${err}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("⚡ checkout.session.completed recebido!");

    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email ?? session.customer_email ?? null;

    const name = session.customer_details?.name ?? "Novo usuário";

    if (!email) return res.json({ received: true });

    // Verifica se usuário existe
    const existingUser = await prisma.user.findUnique({ where: { email } });

    let user;
    let senhaGerada: string | null = null;

    if (!existingUser) {
      // Criar senha aleatória
      senhaGerada = crypto.randomBytes(5).toString("hex");
      const senhaHash = await bcrypt.hash(senhaGerada, 10);

      // Criar usuário
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: senhaHash,
        },
      });

      // Enviar email
      await resend.emails.send({
        from: "ImobTECH <noreply@contato.automatech.app.br>",
        to: email,
        subject: "🎉 Bem-vindo à ImobTECH! Seu acesso foi criado",
        html: `
          <h2>Olá, ${name}</h2>
          <p>Seu acesso foi criado com sucesso!</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Senha:</b> ${senhaGerada}</p>
          <br>
          <a href="https://localhost:3000/login"
            style="background:#4f46e5;color:white;padding:12px 18px;border-radius:6px;text-decoration:none;">
            Acessar painel
          </a>
        `,
      });

      console.log("📩 Email de boas-vindas enviado!");
    } else {
      user = existingUser;
    }

    // Criar perfil se não existir
    const perfil = await prisma.corretorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!perfil) {
      const baseSlug = user.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");

      const slug = `${baseSlug}-${crypto.randomBytes(2).toString("hex")}`;

      await prisma.corretorProfile.create({
        data: {
          userId: user.id,
          slug,
        },
      });

      console.log("🆕 Perfil criado com slug:", slug);
    }

    return res.json({ received: true });
  }

  if (event.type === "invoice.payment_succeeded") {
    console.log("⚡ invoice.payment_succeeded recebido!");

    const invoice = event.data.object as Stripe.Invoice;

    const email = invoice.customer_email;
    if (!email) return res.json({ received: true });

    // Linha principal da fatura
    const line = invoice.lines.data[0] as Stripe.InvoiceLineItem & {
      price?: { id: string };
    };

    const priceId = line.price?.id;
    if (!priceId) return res.json({ received: true });

    const plano = mapPriceToPlano(priceId);
    const period = line.period;
    const end = new Date(period.end * 1000);

    // Atualizar plano direto no perfil
    await prisma.corretorProfile.updateMany({
      where: { user: { email } },
      data: {
        plano,
        planoStatus: "ATIVO",
        stripeCurrentPeriodEnd: end,
      },
    });

    console.log("🟢 Plano atualizado para:", plano);

    return res.json({ received: true });
  }

  // Final
  return res.json({ received: true });
}
