/*
  Warnings:

  - You are about to drop the column `cnjp` on the `TB_CLIENT` table. All the data in the column will be lost.
  - You are about to drop the column `primaryContactPrsonTitle` on the `TB_CLIENT` table. All the data in the column will be lost.
  - The `billingCycleDay` column on the `TB_CLIENT` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cnpj` to the `TB_CLIENT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generalNote` to the `TB_CLIENT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryContactPersonTitle` to the `TB_CLIENT` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TB_CLIENT" DROP CONSTRAINT "TB_CLIENT_billingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "TB_CLIENT" DROP CONSTRAINT "TB_CLIENT_primaryAddressId_fkey";

-- AlterTable
ALTER TABLE "TB_CLIENT" DROP COLUMN "cnjp",
DROP COLUMN "primaryContactPrsonTitle",
ADD COLUMN     "cnpj" VARCHAR(14) NOT NULL,
ADD COLUMN     "generalNote" VARCHAR(255) NOT NULL,
ADD COLUMN     "primaryContactPersonTitle" VARCHAR(50) NOT NULL,
DROP COLUMN "billingCycleDay",
ADD COLUMN     "billingCycleDay" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "billingAddressId" DROP NOT NULL,
ALTER COLUMN "primaryAddressId" DROP NOT NULL;

-- DropTable
DROP TABLE "Address";

-- CreateTable
CREATE TABLE "TB_ADDRESS" (
    "_id" TEXT NOT NULL,
    "street" VARCHAR(255) NOT NULL,
    "number" VARCHAR(10) NOT NULL,
    "complement" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zipCode" VARCHAR(8) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TB_ADDRESS_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "TB_CLIENT" ADD CONSTRAINT "TB_CLIENT_primaryAddressId_fkey" FOREIGN KEY ("primaryAddressId") REFERENCES "TB_ADDRESS"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_CLIENT" ADD CONSTRAINT "TB_CLIENT_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "TB_ADDRESS"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
