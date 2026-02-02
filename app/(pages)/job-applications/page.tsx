// app/(pages)/job-applications/page.tsx
import { getCachedJobApplicationEmails, getJobApplicationEmailsFromDb } from "@/services/prisma"
import { JobApplicationsTable } from "./JobApplicationsTable"
import { JobEmail } from "@/lib/validation/JobEmail/JobEmail"
import { JobApplicationsPageClient } from "./JobApplicationsPageClient"

export default async function Page() {
  // const emails = await getCachedJobApplicationEmails(50)
  const emails = await getJobApplicationEmailsFromDb(50)
  return (
    <>
      <JobApplicationsPageClient emails={emails} />
    </>
  )
}
