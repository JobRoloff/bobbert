-- CreateEnum
CREATE TYPE "FollowUpChannel" AS ENUM ('EMAIL', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "FollowUpDraftStatus" AS ENUM ('DRAFT', 'SENT', 'ARCHIVED');

-- CreateTable
CREATE TABLE "FollowUpDraft" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobEmailId" TEXT NOT NULL,
    "channel" "FollowUpChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "FollowUpDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "rationale" TEXT,
    "model" TEXT,
    "tone" TEXT,

    CONSTRAINT "FollowUpDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowUpDraft_jobEmailId_idx" ON "FollowUpDraft"("jobEmailId");

-- CreateIndex
CREATE INDEX "FollowUpDraft_status_idx" ON "FollowUpDraft"("status");

-- CreateIndex
CREATE INDEX "FollowUpDraft_channel_idx" ON "FollowUpDraft"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpDraft_jobEmailId_channel_status_key" ON "FollowUpDraft"("jobEmailId", "channel", "status");

-- AddForeignKey
ALTER TABLE "FollowUpDraft" ADD CONSTRAINT "FollowUpDraft_jobEmailId_fkey" FOREIGN KEY ("jobEmailId") REFERENCES "JobEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
