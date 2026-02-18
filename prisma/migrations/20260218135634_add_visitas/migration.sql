-- CreateEnum
CREATE TYPE "VisitaStatus" AS ENUM ('AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'NAO_COMPARECEU');

-- CreateTable
CREATE TABLE "Visita" (
    "id" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "nomeVisitante" TEXT NOT NULL,
    "telefoneVisitante" TEXT,
    "emailVisitante" TEXT,
    "observacoes" TEXT,
    "status" "VisitaStatus" NOT NULL DEFAULT 'AGENDADA',
    "corretorId" TEXT NOT NULL,
    "imovelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Visita_corretorId_idx" ON "Visita"("corretorId");

-- CreateIndex
CREATE INDEX "Visita_dataHora_idx" ON "Visita"("dataHora");

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
