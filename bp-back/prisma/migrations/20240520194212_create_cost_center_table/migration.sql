/*
  Warnings:

  - You are about to drop the column `generateNotes` on the `TB_CLIENT` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `legalName` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `cnjp` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(14)`.
  - You are about to alter the column `stateRegistration` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.
  - You are about to alter the column `municipalRegistration` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.
  - You are about to alter the column `contactPhone` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(15)`.
  - You are about to alter the column `primaryContactPerson` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `primaryContactPrsonTitle` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.

*/

-- CreateTable
CREATE TABLE "TB_COST_CENTER" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TB_COST_CENTER_pkey" PRIMARY KEY ("_id")
);
