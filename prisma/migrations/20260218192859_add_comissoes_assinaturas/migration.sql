-- CreateEnum
CREATE TYPE "TipoComissao" AS ENUM ('VENDA', 'ALUGUEL', 'INTERMEDIACAO');

-- CreateEnum
CREATE TYPE "StatusComissao" AS ENUM ('PENDENTE', 'RECEBIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorImovel" DOUBLE PRECISION,
    "percentual" DOUBLE PRECISION,
    "valorComissao" DOUBLE PRECISION NOT NULL,
    "tipo" "TipoComissao" NOT NULL DEFAULT 'VENDA',
    "status" "StatusComissao" NOT NULL DEFAULT 'PENDENTE',
    "dataVenda" TIMESTAMP(3),
    "dataRecebimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "corretorId" TEXT NOT NULL,
    "imovelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "documento" TEXT,
    "assinatura" TEXT NOT NULL,
    "ip" TEXT,
    "assinadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comissao_corretorId_idx" ON "Comissao"("corretorId");

-- CreateIndex
CREATE INDEX "Assinatura_contratoId_idx" ON "Assinatura"("contratoId");

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
