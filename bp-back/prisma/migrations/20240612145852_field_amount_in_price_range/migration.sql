/*
  Warnings:

  - You are about to drop the column `maxConsultations` on the `TB_PRICE_RANGE` table. All the data in the column will be lost.
  - You are about to drop the column `minConsultations` on the `TB_PRICE_RANGE` table. All the data in the column will be lost.
  - You are about to drop the column `priceRangeId` on the `TB_PRICE_RANGE` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TB_PRICE_RANGE" DROP CONSTRAINT "TB_PRICE_RANGE_priceRangeId_fkey";

-- AlterTable
ALTER TABLE "TB_PACKAGE" ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TB_PRICE_RANGE" DROP COLUMN "maxConsultations",
DROP COLUMN "minConsultations",
DROP COLUMN "priceRangeId",
ADD COLUMN     "amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "packageId" TEXT;

-- AddForeignKey
ALTER TABLE "TB_PRICE_RANGE" ADD CONSTRAINT "TB_PRICE_RANGE_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TB_PACKAGE"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
