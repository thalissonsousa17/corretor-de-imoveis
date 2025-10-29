/*
  Warnings:

  - You are about to drop the column `corPrimaria` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `corSecundaria` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `disponivel` on the `Imovel` table. All the data in the column will be lost.
  - The `status` column on the `Imovel` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Finalidade" AS ENUM ('VENDA', 'ALUGUEL');

-- CreateEnum
CREATE TYPE "ImovelStatus" AS ENUM ('DISPONIVEL', 'VENDIDO', 'ALUGADO', 'INATIVO');

-- AlterTable
ALTER TABLE "CorretorProfile" DROP COLUMN "corPrimaria",
DROP COLUMN "corSecundaria";

-- AlterTable
ALTER TABLE "Imovel" DROP COLUMN "disponivel",
ADD COLUMN     "finalidade" "Finalidade" NOT NULL DEFAULT 'VENDA',
DROP COLUMN "status",
ADD COLUMN     "status" "ImovelStatus" NOT NULL DEFAULT 'DISPONIVEL';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
