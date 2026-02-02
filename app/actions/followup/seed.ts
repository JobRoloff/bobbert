// /app/actions/followup/seed.ts
"use server"

import { z } from "zod"
import { seedDueFollowUpDrafts } from "@/services/followupDrafts"

const Input = z.object({
  days: z.number().int().min(1).max(60).default(3),
})

export async function seedFollowUpTodos(input: unknown) {
  const { days } = Input.parse(input)
  return seedDueFollowUpDrafts({ days, channel: "EMAIL", status: "DRAFT" })
}
