/*
  Warnings:

  - The values [TRIAGED] on the enum `JobEmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bodyHTML` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `bodyText` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `receivedAt` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `senderEmail` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `snippet` on the `JobEmail` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `JobEmail` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobEmailStatus_new" AS ENUM ('NEW', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED');
ALTER TABLE "public"."JobEmail" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "JobEmail" ALTER COLUMN "status" TYPE "JobEmailStatus_new" USING ("status"::text::"JobEmailStatus_new");
ALTER TYPE "JobEmailStatus" RENAME TO "JobEmailStatus_old";
ALTER TYPE "JobEmailStatus_new" RENAME TO "JobEmailStatus";
DROP TYPE "public"."JobEmailStatus_old";
ALTER TABLE "JobEmail" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- DropIndex
DROP INDEX "JobEmail_receivedAt_idx";

-- DropIndex
DROP INDEX "JobEmail_senderEmail_idx";

-- DropIndex
DROP INDEX "JobEmail_source_idx";

-- AlterTable
ALTER TABLE "JobEmail" DROP COLUMN "bodyHTML",
DROP COLUMN "bodyText",
DROP COLUMN "company",
DROP COLUMN "receivedAt",
DROP COLUMN "role",
DROP COLUMN "sender",
DROP COLUMN "senderEmail",
DROP COLUMN "snippet",
DROP COLUMN "source",
ADD COLUMN     "applicationLink" TEXT,
ADD COLUMN     "appliedDate" TIMESTAMP(3),
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "jobLink" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "roleTitle" TEXT;

-- DropEnum
DROP TYPE "JobEmailSource";

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,
    "company" TEXT,
    "location" TEXT,
    "applicationLink" TEXT,
    "jobEmailId" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_jobEmailId_idx" ON "Job"("jobEmailId");

-- CreateIndex
CREATE INDEX "JobEmail_appliedDate_idx" ON "JobEmail"("appliedDate");

-- CreateIndex
CREATE INDEX "JobEmail_companyName_idx" ON "JobEmail"("companyName");

-- CreateIndex
CREATE INDEX "JobEmail_roleTitle_idx" ON "JobEmail"("roleTitle");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobEmailId_fkey" FOREIGN KEY ("jobEmailId") REFERENCES "JobEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
