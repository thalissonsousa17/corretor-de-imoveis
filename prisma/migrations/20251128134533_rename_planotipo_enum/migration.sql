/*
  Warnings:

  - The values [MENSAL,SEMESTRAL,ANUAL] on the enum `PlanoTipo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlanoTipo_new" AS ENUM ('GRATUITO', 'START', 'PRO', 'EXPERT');
ALTER TABLE "public"."CorretorProfile" ALTER COLUMN "plano" DROP DEFAULT;
ALTER TABLE "CorretorProfile" ALTER COLUMN "plano" TYPE "PlanoTipo_new" USING ("plano"::text::"PlanoTipo_new");
ALTER TYPE "PlanoTipo" RENAME TO "PlanoTipo_old";
ALTER TYPE "PlanoTipo_new" RENAME TO "PlanoTipo";
DROP TYPE "public"."PlanoTipo_old";
ALTER TABLE "CorretorProfile" ALTER COLUMN "plano" SET DEFAULT 'GRATUITO';
COMMIT;

-- AlterTable
ALTER TABLE "CorretorProfile" ALTER COLUMN "plano" SET DEFAULT 'GRATUITO',
ALTER COLUMN "planoStatus" SET DEFAULT 'INATIVO';
