// app/actions/followup/followups.ts
"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { runFollowUpDraftAgent } from "@/agents/followup.agent"

const Input = z.object({
  jobEmailId: z.string().uuid(),
})

export async function getOrGenerateFollowUpEmailDraft(input: unknown) {
  const { jobEmailId } = Input.parse(input)

  // 1) ensure placeholder exists (uses your unique constraint)
  const draft = await prisma.followUpDraft.upsert({
    where: {
      jobEmailId_channel_status: { jobEmailId, channel: "EMAIL", status: "DRAFT" },
    },
    update: {}, // no-op if exists
    create: {
      jobEmailId,
      channel: "EMAIL",
      status: "DRAFT",
      subject: null,
      body: null,
      isGenerated: false,
    },
  })

  // 2) if already generated, return normalized string (see nullable string type in the FollowupDraftSheet.tsx useState)
    if (draft.isGenerated && draft.subject && draft.body) {
    return {
      id: draft.id,
      subject: draft.subject,
      body: draft.body,
    }
  }

  // 3) fetch JobEmail context (what the generator needs)
  const jobEmail = await prisma.jobEmail.findUnique({
    where: { id: jobEmailId },
    select: {
      id: true,
      appliedDate: true,
      roleTitle: true,
      companyName: true,
      location: true,
      applicationLink: true,
      jobLink: true,
      externalUrl: true,
      subject: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      gmailMessageId: true,
    },
  })

  if (!jobEmail) throw new Error("JobEmail not found")

  // 4) generate + persist
  const {subject, body, rationale, model, tone} = await runFollowUpDraftAgent(jobEmail as any)
const updated = await prisma.followUpDraft.update({
    where: { id: draft.id },
    data: {
      subject,
      body,
      isGenerated: true,
      rationale: rationale ?? null,
      model: model ?? null,
      tone: tone ?? null,
    },
  })

  // ✅ Return normalized strings (no nulls)
  return {
    id: updated.id,
    subject: updated.subject ?? "",
    body: updated.body ?? "",
  }
}
