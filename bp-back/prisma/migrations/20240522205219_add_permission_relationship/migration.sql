-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssignmentsEnum" ADD VALUE 'ADMIN';
ALTER TYPE "AssignmentsEnum" ADD VALUE 'CLIENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModuleEnum" ADD VALUE 'USER';
ALTER TYPE "ModuleEnum" ADD VALUE 'CLIENT';
ALTER TYPE "ModuleEnum" ADD VALUE 'SOURCE';
ALTER TYPE "ModuleEnum" ADD VALUE 'PACKAGE';
ALTER TYPE "ModuleEnum" ADD VALUE 'COST_CENTER';
ALTER TYPE "ModuleEnum" ADD VALUE 'EVENT';

-- AlterTable
ALTER TABLE "TB_USER" ADD COLUMN     "clientId" TEXT;

-- AddForeignKey
ALTER TABLE "TB_USER" ADD CONSTRAINT "TB_USER_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "TB_CLIENT"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
