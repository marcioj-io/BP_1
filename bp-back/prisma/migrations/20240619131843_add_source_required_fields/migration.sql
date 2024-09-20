/*
  Warnings:

  - You are about to drop the column `additionalFields` on the `TB_SOURCE` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TB_SOURCE" DROP COLUMN "additionalFields",
ADD COLUMN     "extraInformation" TEXT[],
ADD COLUMN     "requiredFieldsGeral" TEXT[],
ADD COLUMN     "requiredFieldsPF" TEXT[],
ADD COLUMN     "requiredFieldsPJ" TEXT[];
