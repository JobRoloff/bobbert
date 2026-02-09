"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { getOrGenerateFollowUpEmailDraft } from "@/app/actions/followup/followups"
import { FollowUpDraftSheet } from "./FollowupDraftSheet"
import type { TodoDraft } from "@/services/followupDrafts"

export function FollowUpsList({ todos }: { todos: TodoDraft[] }) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<{ id: string; subject: string; body: string } | null>(
    null
  )
  const [loadingJobEmailId, setLoadingJobEmailId] = React.useState<string | null>(null)
  const [, startTransition] = React.useTransition()

  function onViewDraft(jobEmailId: string) {
    setLoadingJobEmailId(jobEmailId)
    startTransition(async () => {
      try {
        const d = await getOrGenerateFollowUpEmailDraft({ jobEmailId })
        setDraft({ id: d.id, subject: d.subject ?? "", body: d.body ?? "" })
        setOpen(true)
      } finally {
        setLoadingJobEmailId(null)
      }
    })
  }

  return (
    <>
      <ul className="divide-y divide-md-outline-variant">
        {todos.map((todo) => {
          const isLoading = loadingJobEmailId === todo.jobEmailId
          return (
            <li key={todo.id} className="flex justify-between items-center py-3 px-2 hover:bg-md-surface-container-high rounded-md transition-colors group">
              <span className="font-medium tetxt-md-on-surface">{todo.jobEmail.companyName ?? "Unknown company"}</span>

              <button
                type="button"
                className="text-md-primary flex items-center gap-2 text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
                onClick={() => onViewDraft(todo.jobEmailId)}
              >
                <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
                <span className="text-md-primary hover:underline">
                  {isLoading ? "loading..." : "view draft email"}
                </span>
                {/* <span  style={{color:"var(--md-sys-color-primary"}}>{isLoading ? "loading..." : "view draft email"}</span> */}
              </button>
            </li>
          )
        })}
      </ul>

      <FollowUpDraftSheet open={open} onOpenChange={setOpen} draft={draft} />
    </>
  )
}
