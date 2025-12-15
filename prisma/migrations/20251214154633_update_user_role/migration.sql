/*
  Warnings:

  - A unique constraint covering the columns `[authorId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerify" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "dob" SET DATA TYPE DATE;

-- CreateIndex
CREATE UNIQUE INDEX "Post_authorId_key" ON "Post"("authorId");
