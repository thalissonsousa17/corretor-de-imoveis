-- CreateEnum
CREATE TYPE "PlanoTipo" AS ENUM ('START', 'PRO', 'EXPERT');

-- CreateEnum
CREATE TYPE "PlanoStatus" AS ENUM ('ATIVO', 'CANCELADO', 'EXPIRADO');

-- AlterTable
ALTER TABLE "CorretorProfile" ADD COLUMN     "plano" "PlanoTipo" NOT NULL DEFAULT 'START',
ADD COLUMN     "planoCanceladoEm" TIMESTAMP(3),
ADD COLUMN     "planoStatus" "PlanoStatus" NOT NULL DEFAULT 'ATIVO',
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;
