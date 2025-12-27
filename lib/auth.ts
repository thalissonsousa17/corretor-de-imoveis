import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";

export async function getSession(req: NextApiRequest) {
  const sessionToken = req.cookies.session;

  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionToken },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session; // contém userId
}
