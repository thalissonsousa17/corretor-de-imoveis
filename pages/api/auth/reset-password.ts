import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return res.status(400).json({ message: "Link de redefinição inválido ou já utilizado" });
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return res.status(400).json({ message: "Link de redefinição expirado. Solicite um novo." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  // Deleta o token usado e invalida todas as sessões ativas do usuário
  await prisma.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });
  await prisma.session.deleteMany({ where: { userId: resetToken.userId } });

  return res.status(200).json({ message: "Senha alterada com sucesso!" });
}
