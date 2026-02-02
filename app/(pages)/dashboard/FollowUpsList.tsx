// /app/(pages)dashboard/FollowUpsList.tsx
"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { getOrGenerateFollowUpEmailDraft } from "@/app/actions/followup/followups"
import { FollowUpDraftSheet } from "./FollowupDraftSheet"
import type { TodoDraft } from "@/services/followupDrafts"



export function FollowUpsList({ todos }: { todos: TodoDraft[] }) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<{ id: string; subject: string; body: string } | null>(null)
  const [isPending, startTransition] = React.useTransition()

  function onViewDraft(jobEmailId: string) {
    startTransition(async () => {
      const d = await getOrGenerateFollowUpEmailDraft({ jobEmailId })
      setDraft({ id: d.id, subject: d.subject ?? "", body: d.body ?? "" })
      setOpen(true)
    })
  }

  return (
    <>
      <ul>
        {todos.map((t) => (
          <li key={t.id} className="flex gap-2 px-2 items-center">
            <span>
              Follow up with {t.jobEmail.companyName ?? "Unknown company"}
            </span>

            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer text-blue-600 disabled:opacity-60"
              disabled={isPending}
              onClick={() => onViewDraft(t.jobEmailId)}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isPending ? "loading..." : "view draft email"}</span>
            </button>
          </li>
        ))}
      </ul>

      <FollowUpDraftSheet open={open} onOpenChange={setOpen} draft={draft} />
    </>
  )
}
