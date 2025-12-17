/*
  Warnings:

  - The values [FACEBOOK,GOOGLE] on the enum `Provider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Provider_new" AS ENUM ('LOCAL', 'OAUTH');
ALTER TABLE "public"."Profile" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "Profile" ALTER COLUMN "provider" TYPE "Provider_new" USING ("provider"::text::"Provider_new");
ALTER TYPE "Provider" RENAME TO "Provider_old";
ALTER TYPE "Provider_new" RENAME TO "Provider";
DROP TYPE "public"."Provider_old";
ALTER TABLE "Profile" ALTER COLUMN "provider" SET DEFAULT 'LOCAL';
COMMIT;
