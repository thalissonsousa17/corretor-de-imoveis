/*
  Warnings:

  - You are about to drop the column `fotosUrls` on the `Imovel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Imovel" DROP COLUMN "fotosUrls";

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "princial" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "imovelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Foto_imovelId_idx" ON "Foto"("imovelId");

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
