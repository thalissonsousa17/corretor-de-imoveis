-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "rua" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CORRETOR';
