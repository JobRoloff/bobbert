// app/(pages)/job-applications/page.tsx (Server Component – fetches data; Prisma stays on server)
import { getCachedJobApplicationEmails } from "@/services/prisma"
import { JobApplicationsTable } from "./JobApplicationsTable"

export default async function Page() {
  const emails = await getCachedJobApplicationEmails(50)
  return (
    <>
      <h1>Your Individual job application data</h1>
      <JobApplicationsTable emails={emails} />
    </>
  )
}
