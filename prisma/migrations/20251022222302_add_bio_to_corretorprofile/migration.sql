/*
  Warnings:

  - You are about to drop the column `avatar` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `CorretorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `biografia` on the `CorretorProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CorretorProfile" DROP CONSTRAINT "CorretorProfile_userId_fkey";

-- AlterTable
ALTER TABLE "CorretorProfile" DROP COLUMN "avatar",
DROP COLUMN "banner",
DROP COLUMN "biografia",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ALTER COLUMN "creci" DROP NOT NULL,
ALTER COLUMN "corPrimaria" SET DEFAULT '#000000',
ALTER COLUMN "corSecundaria" SET DEFAULT '#ffffff';

-- AddForeignKey
ALTER TABLE "CorretorProfile" ADD CONSTRAINT "CorretorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
