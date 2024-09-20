-- CreateEnum
CREATE TYPE "EventTypeEnum" AS ENUM ('SYSTEM', 'RESEARCH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssignmentsEnum" ADD VALUE 'SOURCE';
ALTER TYPE "AssignmentsEnum" ADD VALUE 'PACKAGE';
ALTER TYPE "AssignmentsEnum" ADD VALUE 'COST_CENTER';
ALTER TYPE "AssignmentsEnum" ADD VALUE 'EVENT';

-- CreateTable
CREATE TABLE "TB_EVENT" (
    "id" SERIAL NOT NULL,
    "type" "EventTypeEnum" NOT NULL DEFAULT 'SYSTEM',
    "event" VARCHAR(100) NOT NULL,
    "additionalData" JSON NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TB_EVENT_pkey" PRIMARY KEY ("id")
);
