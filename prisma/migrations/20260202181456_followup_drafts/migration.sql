-- AlterTable
ALTER TABLE "FollowUpDraft" ADD COLUMN     "isGenerated" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "subject" DROP NOT NULL,
ALTER COLUMN "body" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "FollowUpDraft_isGenerated_idx" ON "FollowUpDraft"("isGenerated");
