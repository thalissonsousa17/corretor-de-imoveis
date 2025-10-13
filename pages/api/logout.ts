import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import prisma from "../../lib/prisma";

export default async function handleLougout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionId = cookies.sessionId;

  if (sessionId) {
    try {
      await prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (error) {
      console.log("Erro ao deletar sessão, mas prosseguindo com o logout do cliente.", error);
    }
  }

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("sessionId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
      expires: new Date(0),
    })
  );
  return res.status(200).json({ message: "Logout realizado com sucesso." });
}
