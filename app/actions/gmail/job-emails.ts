// app/actions/gmail/job-emails.ts
"use server"

import { getGmailService } from "@/services/gmail.server"
import { upsertJobApplicationEmails } from "@/services/prisma"
import { revalidatePath, revalidateTag } from "next/cache"

export async function syncJobEmails() {
  const gmail = getGmailService()
  const emails = await gmail.pollNewJobApplicationEmails(25)

  const { upserted } = await upsertJobApplicationEmails(emails)

  revalidateTag("job-emails", "max")
  revalidatePath("/job-applications")

  return { fetched: emails.length, upserted }
}
