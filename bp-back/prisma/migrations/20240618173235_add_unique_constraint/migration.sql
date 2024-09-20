-- DropIndex
DROP INDEX "TB_USER_email_key";

CREATE UNIQUE INDEX "uq_user_email" ON "TB_USER"("email") WHERE "deletedAt" IS NULL;
