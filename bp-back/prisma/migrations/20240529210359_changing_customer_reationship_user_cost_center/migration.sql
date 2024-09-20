-- AlterTable
ALTER TABLE "TB_USER" ADD COLUMN     "ownsClient" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserCostCenter" (
    "userId" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "UserCostCenter_pkey" PRIMARY KEY ("userId","costCenterId")
);

-- AddForeignKey
ALTER TABLE "UserCostCenter" ADD CONSTRAINT "UserCostCenter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TB_USER"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCostCenter" ADD CONSTRAINT "UserCostCenter_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "TB_COST_CENTER"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
