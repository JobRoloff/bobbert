// app/(pages)/job-applications/page.tsx

import { getJobEmails } from "@/app/actions/gmail/job-emails"
import { Button } from "@/components/ui/button"
import { getJobApplicationEmails } from "@/services/prisma"
import { SyncButton } from "./sync-button"

export default async function Page() {
  const emails = await getJobApplicationEmails(50)
  return (
    <>
      <h1>Your Individual job application data</h1>
      <SyncButton />
    </>
  )
}
