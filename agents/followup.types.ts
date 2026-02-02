// agents/followup.types.ts

import { z } from "zod"

export const FollowUpChannelSchema = z.enum(["EMAIL", "LINKEDIN"])
export type FollowUpChannel = z.infer<typeof FollowUpChannelSchema>

export const GeneratedDraftSchema = z.object({
  channel: FollowUpChannelSchema.default("EMAIL"),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  rationale: z.string().optional(),
  model: z.string().optional(),
  tone: z.string().optional(),
})

export type GeneratedDraft = z.infer<typeof GeneratedDraftSchema>
