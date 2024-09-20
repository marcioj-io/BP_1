/*
  Warnings:

  - A unique constraint covering the columns `[primaryAddressId]` on the table `TB_CLIENT` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[billingAddressId]` on the table `TB_CLIENT` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billingAddressId` to the `TB_CLIENT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryAddressId` to the `TB_CLIENT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TB_CLIENT" ADD COLUMN     "billingAddressId" TEXT NOT NULL,
ADD COLUMN     "primaryAddressId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
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

    CONSTRAINT "Address_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TB_CLIENT_primaryAddressId_key" ON "TB_CLIENT"("primaryAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "TB_CLIENT_billingAddressId_key" ON "TB_CLIENT"("billingAddressId");

-- AddForeignKey
ALTER TABLE "TB_CLIENT" ADD CONSTRAINT "TB_CLIENT_primaryAddressId_fkey" FOREIGN KEY ("primaryAddressId") REFERENCES "Address"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_CLIENT" ADD CONSTRAINT "TB_CLIENT_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
