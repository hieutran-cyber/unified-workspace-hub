-- DropIndex
DROP INDEX "Application_name_key";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'custom';

-- CreateIndex
CREATE UNIQUE INDEX "Application_name_organizationId_key" ON "Application"("name", "organizationId");
