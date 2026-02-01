-- CreateEnum
CREATE TYPE "JobEmailStatus" AS ENUM ('NEW', 'TRIAGED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobEmailSource" AS ENUM ('LINKEDIN', 'HANDSHAKE', 'INDEED', 'GLASSDOOR', 'OTHER');

-- CreateTable
CREATE TABLE "JobEmail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "senderEmail" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "snippet" TEXT,
    "bodyText" TEXT,
    "status" "JobEmailStatus" NOT NULL DEFAULT 'NEW',
    "source" "JobEmailSource" NOT NULL DEFAULT 'OTHER',
    "company" TEXT,
    "role" TEXT,
    "externalUrl" TEXT,

    CONSTRAINT "JobEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobEmail_gmailMessageId_key" ON "JobEmail"("gmailMessageId");

-- CreateIndex
CREATE INDEX "JobEmail_receivedAt_idx" ON "JobEmail"("receivedAt");

-- CreateIndex
CREATE INDEX "JobEmail_status_idx" ON "JobEmail"("status");

-- CreateIndex
CREATE INDEX "JobEmail_source_idx" ON "JobEmail"("source");

-- CreateIndex
CREATE INDEX "JobEmail_senderEmail_idx" ON "JobEmail"("senderEmail");
