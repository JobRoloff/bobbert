// agents/followup.policy.ts

// pure rules: “due after 3 days”, “channel suggestion”, etc.
export const FOLLOWUP_DEFAULT_DAYS = 3

export function isDueForFollowUp(appliedDate: Date | null | undefined, days = FOLLOWUP_DEFAULT_DAYS) {
  if (!appliedDate) return false
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return appliedDate <= cutoff
}
