// /lib/validation/FollowUpDraft/FollowUpDraft.ts
import { z } from "zod"

export const FollowUpChannelSchema = z.enum(["EMAIL", "LINKEDIN"])
export type FollowUpChannel = z.infer<typeof FollowUpChannelSchema>

export const FollowUpDraftStatusSchema = z.enum(["DRAFT", "SENT", "ARCHIVED"])
export type FollowUpDraftStatus = z.infer<typeof FollowUpDraftStatusSchema>

export const FollowUpDraftSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  jobEmailId: z.string().uuid(),

  channel: FollowUpChannelSchema,
  status: FollowUpDraftStatusSchema,

  subject: z.string().min(1).max(200).optional().nullable(),
  body: z.string().min(1).optional().nullable(),
  isGenerated: z.boolean(),

  rationale: z.string().min(1).max(2000).optional().nullable(),
  model: z.string().min(1).max(80).optional().nullable(),
  tone: z.string().min(1).max(120).optional().nullable(),
})

export type FollowUpDraft = z.infer<typeof FollowUpDraftSchema>

/**
 * What your "agent output" / server action should produce when generating a draft.
 * (No id/timestamps; those are DB-owned.)
 */
export const CreateFollowUpDraftInputSchema = z.object({
  jobEmailId: z.string().uuid(),
  channel: FollowUpChannelSchema.default("EMAIL"),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),

  rationale: z.string().min(1).max(2000).optional(),
  model: z.string().min(1).max(80).optional(),
  tone: z.string().min(1).max(120).optional(),
})

export type CreateFollowUpDraftInput = z.infer<typeof CreateFollowUpDraftInputSchema>
