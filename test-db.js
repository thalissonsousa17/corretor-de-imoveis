const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Tentando conectar ao banco...");
    const count = await prisma.user.count();
    console.log("Conexão OK! Total de usuários:", count);
  } catch (e) {
    console.error("ERRO DE CONEXÃO:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
