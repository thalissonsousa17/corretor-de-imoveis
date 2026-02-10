import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";

export async function getSession(req: NextApiRequest) {
  const sessionToken =
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"] ||
    req.cookies["session"];

  if (!sessionToken) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Erro na validação da sessão:", error);
    return null;
  }
}
