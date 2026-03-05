import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import * as cookie from "cookie";
import { cookieOptions } from "@/lib/cookies";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, password } = req.body;

  try {
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) return res.status(401).json({ message: "Credenciais inválidas" });

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin.from("Session").insert({ id: sessionId, userId: user.id, expiresAt });

    // Registra log de acesso (fire and forget)
    void (async () => {
      try {
        await supabaseAdmin.from("LogAcesso").insert({
          id: randomUUID(),
          userId: user.id,
          loginAt: new Date().toISOString(),
          sessionId,
        });
      } catch {}
    })();

    res.setHeader(
      "Set-Cookie",
      serialize("sessionId", sessionId, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor", error });
  }
}
