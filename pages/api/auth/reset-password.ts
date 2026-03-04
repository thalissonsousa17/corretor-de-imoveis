import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { supabaseAdmin } from "@/lib/supabase";

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

  const { data: resetToken } = await supabaseAdmin
    .from("PasswordResetToken")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!resetToken) {
    return res.status(400).json({ message: "Link de redefinição inválido ou já utilizado" });
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    await supabaseAdmin.from("PasswordResetToken").delete().eq("id", resetToken.id);
    return res.status(400).json({ message: "Link de redefinição expirado. Solicite um novo." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await supabaseAdmin.from("User").update({ password: hashedPassword }).eq("id", resetToken.userId);

  // Deleta o token usado e invalida todas as sessões ativas do usuário
  await supabaseAdmin.from("PasswordResetToken").delete().eq("userId", resetToken.userId);
  await supabaseAdmin.from("Session").delete().eq("userId", resetToken.userId);

  return res.status(200).json({ message: "Senha alterada com sucesso!" });
}
