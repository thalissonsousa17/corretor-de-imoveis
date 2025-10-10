/*
  Warnings:

  - You are about to drop the column `princial` on the `Foto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Foto" DROP COLUMN "princial",
ADD COLUMN     "principal" BOOLEAN NOT NULL DEFAULT false;
