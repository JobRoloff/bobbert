"use server";

import { getGmailService } from "@/services/gmail.server";
import { prisma } from "@/lib/prisma"; // prisma or your db client
import { revalidatePath } from "next/cache";

export async function getJobEmails(){
  const gmail = getGmailService()
  const emails = await gmail.fetchJobApplicationEmails(20);
  return emails
}
export async function syncJobEmails() {
  const gmail = getGmailService();
  const emails = await gmail.fetchJobApplicationEmails(25);

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
    //     bodyHtml: e.bodyHtml,
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
    //     status: e.status,
    //     source: e.source,
    //     company: e.company,
    //     role: e.role,
    //     externalUrl: e.externalUrl,
    //   },
    // });
  }

  // refresh the page after syncing
  revalidatePath("/job-applicattions");
  console.log("emails:", emails)
  return { synced: emails.length };
}
