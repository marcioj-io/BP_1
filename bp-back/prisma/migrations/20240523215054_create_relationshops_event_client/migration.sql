/*
  Warnings:

  - The primary key for the `TB_EVENT` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TB_EVENT` table. All the data in the column will be lost.
  - The required column `_id` was added to the `TB_EVENT` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `TB_EVENT` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `event` on the `TB_EVENT` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventEnum" AS ENUM ('LOGIN', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "TB_EVENT" DROP CONSTRAINT "TB_EVENT_pkey",
DROP COLUMN "id",
ADD COLUMN     "_id" TEXT NOT NULL,
ADD COLUMN     "ip" VARCHAR(255),
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "event",
ADD COLUMN     "event" "EventEnum" NOT NULL,
ADD CONSTRAINT "TB_EVENT_pkey" PRIMARY KEY ("_id");

-- AddForeignKey
ALTER TABLE "TB_EVENT" ADD CONSTRAINT "TB_EVENT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TB_USER"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
