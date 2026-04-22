-- AlterTable
ALTER TABLE "RoleAppMapping" ADD COLUMN "appGroups" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "appCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "appRoleName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "propertyId";

-- DropTable
DROP TABLE "PropertyMapping" CASCADE;

-- DropTable
DROP TABLE "Property" CASCADE;
