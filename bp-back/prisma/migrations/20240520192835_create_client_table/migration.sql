-- CreateTable
CREATE TABLE "TB_CLIENT" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "legalName" VARCHAR(255) NOT NULL,
    "cnjp" VARCHAR(255) NOT NULL,
    "stateRegistration" VARCHAR(255) NOT NULL,
    "municipalRegistration" VARCHAR(255) NOT NULL,
    "contactPhone" VARCHAR(255) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "primaryContactPerson" VARCHAR(255) NOT NULL,
    "primaryContactPrsonTitle" VARCHAR(255) NOT NULL,
    "useTaxInvoice" BOOLEAN NOT NULL DEFAULT false,
    "generateNotes" VARCHAR(255) NOT NULL,
    "billingCycleDay" VARCHAR(255) NOT NULL,
    "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "ip" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TB_CLIENT_pkey" PRIMARY KEY ("_id")
);
-- AlterTable
ALTER TABLE "TB_CLIENT" DROP COLUMN "generateNotes",
ADD COLUMN     "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "legalName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "cnjp" SET DATA TYPE VARCHAR(14),
ALTER COLUMN "stateRegistration" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "municipalRegistration" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "contactPhone" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "primaryContactPerson" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "primaryContactPrsonTitle" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "TB_CLIENT_contactEmail_key" ON "TB_CLIENT"("contactEmail");
