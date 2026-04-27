-- AlterTable
ALTER TABLE "User" ADD COLUMN "defaultOrganizationId" TEXT;
ALTER TABLE "User" ALTER COLUMN "category" SET DEFAULT 'standard';
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'active';
ALTER TABLE "User" ALTER COLUMN "type" SET DEFAULT 'user';
