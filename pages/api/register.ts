import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

export default async function handleRegister(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { name, email, password, adminCode } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const { data: existingUser } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ message: "Usuário já existe." });
    }

    let role = "CORRETOR";

    if (adminCode) {
      const expectedCode = process.env.ADMIN_SECRET_CODE;

      if (!expectedCode) {
        return res.status(500).json({ message: "Código de administrador não configurado no servidor." });
      }

      if (adminCode !== expectedCode) {
        return res.status(403).json({ message: "Código de administrador inválido." });
      }

      const { count } = await supabaseAdmin
        .from("User")
        .select("*", { count: "exact", head: true })
        .eq("role", "ADMIN");

      if (count && count > 0) {
        return res.status(409).json({ message: "Já existe um administrador cadastrado no sistema." });
      }

      role = "ADMIN";
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabaseAdmin
      .from("User")
      .insert({ id: randomUUID(), name, email, password: hashedPassword, role })
      .select("id,email,role")
      .single();

    if (error) throw new Error(error.message);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      message: role === "ADMIN"
        ? "Administrador criado com sucesso!"
        : "Usuário criado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}
