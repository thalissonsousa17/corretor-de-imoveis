import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  // Prisma Accelerate (produção no Vercel — URL começa com "prisma://")
  if (url.startsWith("prisma://") || url.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: url,
      log: ["error", "warn"],
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  // Conexão direta via pg (dev local com IPv6)
  const adapter = new PrismaPg({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter, log: ["error", "warn"] });
}

export const prisma = globalForPrisma.prisma ?? buildPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
