/*
  Warnings:

  - Added the required column `clientId` to the `TB_COST_CENTER` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TB_COST_CENTER" ADD COLUMN     "clientId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TB_PACKAGE" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deliveryForecastIndays" INTEGER NOT NULL DEFAULT 0,
    "simpleForm" BOOLEAN NOT NULL DEFAULT false,
    "notes" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "clientId" TEXT NOT NULL,

    CONSTRAINT "TB_PACKAGE_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "_ClientToPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClientToPackage_AB_unique" ON "_ClientToPackage"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientToPackage_B_index" ON "_ClientToPackage"("B");

-- AddForeignKey
ALTER TABLE "TB_COST_CENTER" ADD CONSTRAINT "TB_COST_CENTER_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "TB_CLIENT"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToPackage" ADD CONSTRAINT "_ClientToPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "TB_CLIENT"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToPackage" ADD CONSTRAINT "_ClientToPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "TB_PACKAGE"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
