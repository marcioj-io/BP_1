-- CreateEnum
CREATE TYPE "ApplicationEnum" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'BOTH');

-- CreateTable
CREATE TABLE "TB_SOURCE" (
    "_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "validityInDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "application" "ApplicationEnum" NOT NULL DEFAULT 'INDIVIDUAL',

    CONSTRAINT "TB_SOURCE_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "_PackageToSource" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PackageToSource_AB_unique" ON "_PackageToSource"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageToSource_B_index" ON "_PackageToSource"("B");

-- AddForeignKey
ALTER TABLE "_PackageToSource" ADD CONSTRAINT "_PackageToSource_A_fkey" FOREIGN KEY ("A") REFERENCES "TB_PACKAGE"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToSource" ADD CONSTRAINT "_PackageToSource_B_fkey" FOREIGN KEY ("B") REFERENCES "TB_SOURCE"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
