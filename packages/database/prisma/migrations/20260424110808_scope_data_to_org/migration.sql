-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "CentralRole" ADD COLUMN     "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "CentralRole" ADD CONSTRAINT "CentralRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

