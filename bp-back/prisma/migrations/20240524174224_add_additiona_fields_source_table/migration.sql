/*
  Warnings:

  - You are about to alter the column `billingCycleDay` on the `TB_CLIENT` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Added the required column `additionalFields` to the `TB_SOURCE` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TB_CLIENT" ALTER COLUMN "billingCycleDay" SET DEFAULT 0,
ALTER COLUMN "billingCycleDay" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "TB_SOURCE" ADD COLUMN     "additionalFields" JSON NOT NULL;
