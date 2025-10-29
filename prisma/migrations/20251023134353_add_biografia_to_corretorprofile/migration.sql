/*
  Warnings:

  - You are about to drop the column `bio` on the `CorretorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CorretorProfile" DROP COLUMN "bio",
ADD COLUMN     "biografia" TEXT;
