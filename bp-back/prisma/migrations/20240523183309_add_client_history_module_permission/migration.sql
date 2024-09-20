/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `TB_CLIENT` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AssignmentsEnum" ADD VALUE 'CLIENT_HISTORY';

-- AlterEnum
ALTER TYPE "ModuleEnum" ADD VALUE 'CLIENT_HISTORY';

-- DropIndex
DROP INDEX "TB_CLIENT_contactEmail_key";

-- CreateIndex
CREATE UNIQUE INDEX "TB_CLIENT_cnpj_key" ON "TB_CLIENT"("cnpj");
