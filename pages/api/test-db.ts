import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const safeUrl = (process.env.DATABASE_URL ?? "not set").replace(/:[^:@]+@/, ":***@");
  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    return res.status(200).json({ status: "connected", url: safeUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg, url: safeUrl });
  }
}
