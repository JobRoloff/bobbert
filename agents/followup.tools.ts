// agents/followup.tools.ts

// tools: query due apps, save draft, etc.
import "server-only"
import { prisma } from "@/lib/prisma"

export async function getJobEmailContext(jobEmailId: string) {
  return prisma.jobEmail.findUnique({
    where: { id: jobEmailId },
    select: {
      id: true,
      appliedDate: true,
      roleTitle: true,
      companyName: true,
      location: true,
      applicationLink: true,
      jobLink: true,
      externalUrl: true,
      subject: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      gmailMessageId: true,
    },
  })
}
