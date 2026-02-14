-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('ALUGUEL_RESIDENCIAL', 'ALUGUEL_COMERCIAL', 'COMPRA_VENDA', 'INTERMEDIACAO', 'LOCACAO_TEMPORADA', 'PERSONALIZADO');

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" "TipoContrato" NOT NULL DEFAULT 'PERSONALIZADO',
    "corretorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contrato_corretorId_idx" ON "Contrato"("corretorId");

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
