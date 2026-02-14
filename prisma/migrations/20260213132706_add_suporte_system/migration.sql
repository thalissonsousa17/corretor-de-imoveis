-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO');

-- CreateEnum
CREATE TYPE "TicketPrioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "TicketSuporte" (
    "id" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'ABERTO',
    "prioridade" "TicketPrioridade" NOT NULL DEFAULT 'MEDIA',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketSuporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensagemSuporte" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MensagemSuporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketSuporte_userId_idx" ON "TicketSuporte"("userId");

-- CreateIndex
CREATE INDEX "MensagemSuporte_ticketId_idx" ON "MensagemSuporte"("ticketId");

-- AddForeignKey
ALTER TABLE "TicketSuporte" ADD CONSTRAINT "TicketSuporte_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensagemSuporte" ADD CONSTRAINT "MensagemSuporte_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensagemSuporte" ADD CONSTRAINT "MensagemSuporte_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "TicketSuporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;
