-- CreateTable
CREATE TABLE "TB_USER_SOURCE" (
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "TB_USER_SOURCE_pkey" PRIMARY KEY ("userId","sourceId")
);

-- AddForeignKey
ALTER TABLE "TB_USER_SOURCE" ADD CONSTRAINT "TB_USER_SOURCE_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TB_USER"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TB_USER_SOURCE" ADD CONSTRAINT "TB_USER_SOURCE_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "TB_SOURCE"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;