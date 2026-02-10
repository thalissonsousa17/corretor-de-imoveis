/*
  Warnings:

  - You are about to drop the column `dominioPersonalizado` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dominioStatus` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dominioUltimaVerificacao` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dominioVerificadoEm` on the `CorretorProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CorretorProfile_dominioPersonalizado_key";

-- AlterTable
ALTER TABLE "CorretorProfile" DROP COLUMN "dominioPersonalizado",
DROP COLUMN "dominioStatus",
DROP COLUMN "dominioUltimaVerificacao",
DROP COLUMN "dominioVerificadoEm";

-- CreateTable
CREATE TABLE "Dominio" (
    "id" TEXT NOT NULL,
    "dominio" TEXT NOT NULL,
    "status" "DominioStatus" NOT NULL DEFAULT 'PENDENTE',
    "userId" TEXT NOT NULL,
    "paginaId" TEXT,
    "verificadoEm" TIMESTAMP(3),
    "ultimaVerificacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dominio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagina" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dominio_dominio_key" ON "Dominio"("dominio");

-- CreateIndex
CREATE UNIQUE INDEX "Dominio_paginaId_key" ON "Dominio"("paginaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pagina_slug_key" ON "Pagina"("slug");

-- AddForeignKey
ALTER TABLE "Dominio" ADD CONSTRAINT "Dominio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dominio" ADD CONSTRAINT "Dominio_paginaId_fkey" FOREIGN KEY ("paginaId") REFERENCES "Pagina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
