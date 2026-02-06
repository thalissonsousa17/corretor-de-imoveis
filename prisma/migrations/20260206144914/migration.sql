/*
  Warnings:

  - A unique constraint covering the columns `[dominioPersonalizado]` on the table `CorretorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DominioStatus" AS ENUM ('PENDENTE', 'ATIVO', 'ERRO', 'BLOQUEADO');

-- AlterTable
ALTER TABLE "CorretorProfile" ADD COLUMN     "dominioPersonalizado" TEXT,
ADD COLUMN     "dominioStatus" "DominioStatus" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "dominioUltimaVerificacao" TIMESTAMP(3),
ADD COLUMN     "dominioVerificadoEm" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "CorretorProfile_dominioPersonalizado_key" ON "CorretorProfile"("dominioPersonalizado");
