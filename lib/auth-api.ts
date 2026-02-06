import type { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { parse } from "cookie";

export async function getUserFromApiRequest(req: NextApiRequest) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const parsed = parse(cookies);
  const sessionToken = parsed["session"];

  if (!sessionToken) return null;

  const session = await prisma.session.findFirst({
    where: {
      id: sessionToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  return session?.user ?? null;
}
