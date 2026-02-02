import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { UpsertJobEmailInput } from "@/lib/validation/JobEmail/JobEmail"
import type { JobEmail } from "@prisma/client"
import { Prisma } from "@prisma/client"

export async function getJobApplicationEmailsFromDb(limit = 50): Promise<JobEmail[]> {
  try {
    return await prisma.jobEmail.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma code:", err.code)
      console.error("Prisma meta:", err.meta)
      console.dir(err.meta, { depth: null })
      console.error("Prisma message:", err.message)
    }
    throw err
  }
}

const CACHE_TAG = "job-emails"
const REVALIDATE_SECONDS = 12000

const getCachedJobApplicationEmailsImpl = unstable_cache(
  async (limit: number) => getJobApplicationEmailsFromDb(limit),
  [CACHE_TAG],
  { tags: [CACHE_TAG], revalidate: REVALIDATE_SECONDS }
)

export function getCachedJobApplicationEmails(limit = 50) {
  return getCachedJobApplicationEmailsImpl(limit)
}

/**
 * Upserts Gmail-parsed job emails into DB.
 * Returns count of records processed.
 */
export async function upsertJobApplicationEmails(jobsToAdd: UpsertJobEmailInput[]) {
  if (!jobsToAdd.length) return { upserted: 0 }

  // De-dupe by gmailMessageId to avoid redundant writes
  const seen = new Set<string>()
  const unique = jobsToAdd.filter((j) => {
    const id = (j.gmailMessageId ?? "").trim()
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })

  for (const job of unique) {
    await prisma.jobEmail.upsert({
      where: { gmailMessageId: job.gmailMessageId },
      create: {
        gmailMessageId: job.gmailMessageId,
        subject: job.subject,
        sender: job.sender,
        senderEmail: job.senderEmail,
        receivedAt: job.receivedAt,
        snippet: job.snippet,
        bodyText: job.bodyText,
        bodyHTML: job.bodyHTML,
        status: job.status,
        source: job.source,
        company: job.company,
        role: job.role,
        externalUrl: job.externalUrl,
      },
      update: {
        subject: job.subject,
        sender: job.sender,
        senderEmail: job.senderEmail,
        receivedAt: job.receivedAt,
        snippet: job.snippet,
        bodyText: job.bodyText,
        bodyHTML: job.bodyHTML,
        status: job.status,
        source: job.source,
        company: job.company,
        role: job.role,
        externalUrl: job.externalUrl,
      },
    })
  }

  return { upserted: unique.length }
}
