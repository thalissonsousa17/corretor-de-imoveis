import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import cookie from "cookie"; // Lembre-se de instalar: npm install cookie

// Sessão expira em 1 dia (em segundos)
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24;

export default async function handleLogin(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // 1. Criar a nova sessão no banco de dados
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_SECONDS * 1000);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // 2. Enviar o ID da sessão para o cliente via Cookie
    const sessionCookie = cookie.serialize("sessionId", session.id, {
      httpOnly: true, // Essencial para segurança (não acessível via JS)
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_EXPIRY_SECONDS,
      path: "/",
    });

    res.setHeader("Set-Cookie", sessionCookie);

    // 3. Sucesso: Retornar dados básicos do usuário
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
}
