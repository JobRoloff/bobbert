// /agents/generateFollowUpEmailDraft.ts

import "server-only"
import type { JobEmail } from "@/lib/validation/JobEmail/JobEmail"

export type GeneratedDraft = {
  channel: "EMAIL"
  subject: string
  body: string
  rationale?: string
  model?: string
  tone?: string
}

/**
 * Replace the internals with OpenAI Agents SDK later.
 * For now, deterministic template so the UI + upsert flow works.
 */
export async function generateFollowUpEmailDraft(email: JobEmail): Promise<GeneratedDraft> {
  const company = email.companyName ?? "the team"
  const role = email.roleTitle ?? "the role"
  const appliedDate = email.appliedDate
    ? new Date(email.appliedDate).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "recently"

  const subject = `Following up on my ${role} application`

  const body =
`Hi ${company} team,

I applied for the ${role} position on ${appliedDate} and wanted to follow up to see if there are any updates on the hiring process.

I’m still very interested and would love to share any additional information that could be helpful.

Thanks for your time,
Job`

  return {
    channel: "EMAIL",
    subject,
    body,
    rationale: "User applied and is due for a follow-up; drafted a concise, professional check-in.",
    model: "template-v0",
    tone: "professional, concise",
  }
}
