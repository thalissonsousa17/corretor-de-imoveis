-- DropForeignKey
ALTER TABLE "Foto" DROP CONSTRAINT "Foto_imovelId_fkey";

-- DropForeignKey
ALTER TABLE "Imovel" DROP CONSTRAINT "Imovel_corretorId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
