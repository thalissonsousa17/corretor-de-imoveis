// Conteúdo esperado em lib/prisma.ts

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// ... (O trecho para hot-reload do Next.js)
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

// OBRIGATÓRIO: Esta linha garante que 'import prisma from...' funcione
export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
