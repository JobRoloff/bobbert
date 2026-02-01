import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { JobEmail, UpsertJobEmailInput } from "@/lib/validation/JobEmail/JobEmail"
import { Prisma } from "@prisma/client"

export async function getJobApplicationEmails(limit: number = 50): Promise<JobEmail[]> {
  /**
   * P2021 → table missing → migrate/push (Section 1)

    P2022 → column missing → migrate (Section 5)

    P1001/P1002 → can’t reach DB → connection/URL/DB running

    P1013 → invalid DB string or configuration
   */
  try {
    return await prisma.jobEmail.findMany({
      take: limit,
      orderBy: {receivedAt: "desc"}
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

// setup server side caching for the async function thattt pulls data from prisma
const CACHE_TAG = "job-emails"
const REVALIDATE_SECONDS = 12000

/** Cached job emails for the list view. Revalidates after 60s or when revalidateTag("job-emails") is called (e.g. after sync). */
export function getCachedJobApplicationEmails(limit: number = 50): Promise<JobEmail[]> {
  return unstable_cache(() => getJobApplicationEmails(limit), [CACHE_TAG, String(limit)], {
    tags: [CACHE_TAG],
    revalidate: REVALIDATE_SECONDS,
  })()
}

export async function addJobApplicationEmails(jobsToAdd: UpsertJobEmailInput[]) {}
