-- CreateEnum
CREATE TYPE "LeadOrigem" AS ENUM ('SITE', 'MANUAL', 'INDICACAO', 'WHATSAPP', 'PORTAL');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "corretorId" TEXT,
ADD COLUMN     "imovelInteresse" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "origem" "LeadOrigem" NOT NULL DEFAULT 'SITE',
ADD COLUMN     "telefone" TEXT;

-- CreateIndex
CREATE INDEX "Lead_corretorId_idx" ON "Lead"("corretorId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
