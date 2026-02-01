"use server"

import { getGmailService } from "@/services/gmail.server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function getJobEmails() {
  const gmail = getGmailService()
  const emails = await gmail.fetchNewJobApplicationEmails(20)
  return emails
}
export async function syncJobEmails() {
  const gmail = getGmailService()
  const emails = await gmail.fetchNewJobApplicationEmails(25)

  // Upsert into your DB (shape matches UpsertJobEmailInput from lib/validation/JobEmail)
  // If you're using Prisma, this is typically db.jobEmail.upsert(...)
  for (const e of emails) {
    // await prisma.jobEmail.upsert({
    //   where: { gmailMessageId: e.gmailMessageId },
    //   create: {
    //     gmailMessageId: e.gmailMessageId,
    //     gmailThreadId: e.gmailThreadId,
    //     gmailLabelIds: e.gmailLabelIds,
    //     subject: e.subject,
    //     sender: e.sender,
    //     senderEmail: e.senderEmail,
    //     receivedAt: e.receivedAt,
    //     snippet: e.snippet,
    //     bodyText: e.bodyText,
    //     bodyHTML: e.bodyHTML,
    //     rawHeaders: e.rawHeaders,
    //     status: e.status,
    //     source: e.source,
    //     company: e.company,
    //     role: e.role,
    //     externalUrl: e.externalUrl,
    //   },
    //   update: {
    //     gmailThreadId: e.gmailThreadId,
    //     gmailLabelIds: e.gmailLabelIds,
    //     subject: e.subject,
    //     sender: e.sender,
    //     senderEmail: e.senderEmail,
    //     receivedAt: e.receivedAt,
    //     snippet: e.snippet,
    //     bodyText: e.bodyText,
    //     bodyHTML: e.bodyHTML,
    //     status: e.status,
    //     source: e.source,
    //     company: e.company,
    //     role: e.role,
    //     externalUrl: e.externalUrl,
    //   },
    // });
  }

  // a cache tag is a label you attach to cached data. It's a simple string that names the cache entry. This is used when (creating the cache && invalidating )
  revalidateTag("job-emails", "max")
  revalidatePath("/job-applications")
  console.log("emails:", emails)
  return { synced: emails.length }
}
