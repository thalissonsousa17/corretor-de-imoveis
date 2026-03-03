import type { NextApiRequest, NextApiResponse } from "next";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Remove tokens antigos deste usuário
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      // Gera token seguro
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://corretor-de-imoveis-mu.vercel.app";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "ImobCorretor <no-reply@contato.automatech.app.br>",
        to: user.email,
        subject: "Redefinição de senha — ImobCorretor",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#1d4ed8">Redefinição de senha</h2>
            <p>Olá, <strong>${user.name}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
            <a href="${resetUrl}"
               style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;
                      text-decoration:none;border-radius:6px;font-weight:bold">
              Redefinir minha senha
            </a>
            <p style="color:#6b7280;font-size:13px">
              Se você não solicitou a redefinição, pode ignorar este email — sua senha permanece a mesma.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
            <p style="color:#9ca3af;font-size:12px">ImobCorretor — Plataforma para corretores de imóveis</p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      message: "Se o email estiver cadastrado, você receberá um link de redefinição em breve.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("FORGOT_PASSWORD_ERROR:", msg);
    return res.status(500).json({ message: "Erro interno.", detail: msg });
  }
}
