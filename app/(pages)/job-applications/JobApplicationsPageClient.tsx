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
import { htmlToText, parseEmailHtmlToObject } from "@/lib/html-to-text"

export function JobApplicationsPageClient({ emails }: { emails: JobEmail[] }) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<JobEmail | null>(null)

  function handleView(email: JobEmail) {
    setSelected(email)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <>
      <JobApplicationsTable emails={emails} onView={handleView} />

      <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <SheetContent side="right" className="w-[420px] sm:w-[520px] p-2">
          <SheetHeader>
            <SheetTitle>Job Email Details</SheetTitle>
            <SheetDescription>
              {selected
                ? `${selected.companyName ?? "Unknown company"} • ${selected.roleTitle ?? "Unknown role"}`
                : "Select an email to view details."}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="mt-4 h-[calc(100vh-140px)] pr-4">
            {!selected ? (
              <div className="text-sm opacity-70">No email selected.</div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <a className="opacity-70" href={selected.applicationLink || undefined}>
                    View Email
                  </a>
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
                {(() => {
                  const html = selected.bodyHTML
                  const text = selected.bodyText

                  const parsed = html
                    ? parseEmailHtmlToObject({
                        html,
                        gmailMessageId: selected.gmailMessageId,
                        gmailMailbox: "all",
                        gmailUserIndex: 0,
                      })
                    : null

                  const displayText =
                    (text && text.trim()) ||
                    (parsed?.plainText && parsed.plainText.trim()) ||
                    selected.snippet ||
                    ""

                  return (
                    <div className="space-y-3">
                      {parsed?.links?.length ? (
                        <div>
                          <div className="opacity-70 mb-1">Links</div>
                          <ul className="space-y-1">
                            {parsed.links.slice(0, 8).map((l) => (
                              <li key={l.href} className="truncate">
                                <a
                                  href={l.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline"
                                >
                                  {l.text || l.href}
                                </a>
                                <span className="opacity-60"> • {l.kind}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div>
                        <div className="opacity-70 mb-1">Body</div>
                        <pre className="whitespace-pre-wrap text-xs leading-5">{displayText}</pre>
                      </div>

                      {/* {parsed?.originalEmail?.gmailUrl ? (
                        <div>
                          <a
                            href={parsed.originalEmail.gmailUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-xs"
                          >
                            Open in Gmail
                          </a>
                        </div>
                      ) : null} */}
                    </div>
                  )
                })()}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
