/*
  Warnings:

  - You are about to drop the column `deliveryForecastIndays` on the `TB_PACKAGE` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TB_PACKAGE" DROP COLUMN "deliveryForecastIndays",
ADD COLUMN     "deliveryForecastInDays" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TB_PRICE_RANGE" (
    "_id" TEXT NOT NULL,
    "minConsultations" INTEGER NOT NULL DEFAULT 0,
    "maxConsultations" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "priceRangeId" TEXT NOT NULL,

    CONSTRAINT "TB_PRICE_RANGE_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "TB_PRICE_RANGE" ADD CONSTRAINT "TB_PRICE_RANGE_priceRangeId_fkey" FOREIGN KEY ("priceRangeId") REFERENCES "TB_PACKAGE"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
