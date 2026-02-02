// app/(pages)/job-applications/JobApplicationsPageClient.tsx
"use client"

import * as React from "react"
import type { JobEmail } from "@/lib/validation/JobEmail/JobEmail"
import { JobApplicationsTable } from "./JobApplicationsTable"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

export function JobApplicationsPageClient({ emails }: { emails: JobEmail[] }) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<JobEmail | null>(null)

  function handleView(email: JobEmail) {
    setSelected(email)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    // optional: clear when closing
    // setSelected(null)
  }

  return (
    <>
      <JobApplicationsTable emails={emails} onView={handleView} />

      <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <SheetContent side="right" className="w-[420px] sm:w-[520px]">
          <SheetHeader>
            <SheetTitle>Job email</SheetTitle>
            <SheetDescription>
              {selected
                ? `${selected.company ?? "Unknown company"} • ${selected.role ?? "Unknown role"}`
                : "Select an email to view details."}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-4 h-[calc(100vh-140px)] pr-4">
            {!selected ? (
              <div className="text-sm opacity-70">No email selected.</div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="opacity-70">From</div>
                  <div>{selected.senderEmail ?? selected.sender}</div>
                </div>

                <div>
                  <div className="opacity-70">Subject</div>
                  <div className="font-medium">{selected.subject}</div>
                </div>

                <div>
                  <div className="opacity-70">Status</div>
                  <div>{selected.status}</div>
                </div>

                {/* If you stored large HTML, prefer rendering text or sanitized HTML */}
                {selected.bodyText ? (
                  <div>
                    <div className="opacity-70">Body (text)</div>
                    <pre className="whitespace-pre-wrap">{selected.bodyText}</pre>
                  </div>
                ) : null}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
