// agents/followup.agent.ts

// Agent definition : instructions, model, output schema
import "server-only"
import type { JobEmail } from "@/lib/validation/JobEmail/JobEmail"
import { GeneratedDraftSchema, type GeneratedDraft } from "./followup.types"
import { generateFollowUpEmailDraft } from "./generateFollowUpEmailDraft"

/**
 * Later: replace internals with OpenAI Agents SDK.
 * Today: a validated wrapper around your deterministic generator.
 */
export async function runFollowUpDraftAgent(email: JobEmail): Promise<GeneratedDraft> {
  const draft = await generateFollowUpEmailDraft(email)
  return GeneratedDraftSchema.parse(draft)
}
