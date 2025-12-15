import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { email, password } = req.body;

  try {
    console.log("Buscando usuário:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("Usuário encontrado:", user);

    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    console.log("Comparando senha...");
    const senhaValida = await bcrypt.compare(password, user.password);
    console.log("Senha válida:", senhaValida);
    if (!senhaValida) return res.status(401).json({ message: "Credenciais inválidas" });

    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log("Criando sessão...");
    await prisma.session.create({
      data: { id: sessionId, userId: user.id, expiresAt },
    });
    console.log("Sessão criada com sucesso");

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("sessionId", sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
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
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor", error });
  }
}
