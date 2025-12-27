import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function getUserFromRequest(req: NextRequest) {
  const sessionToken = req.cookies.get("session")?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionToken },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}
