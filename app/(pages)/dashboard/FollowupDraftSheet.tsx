// /app/(pages)/dashboard/FollowUpDraftSheet.tsx

"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

type Draft = {
  id: string
  subject: string
  body: string
}

export function FollowUpDraftSheet(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: Draft | null
}) {
  const { open, onOpenChange, draft } = props

  async function copyAll() {
    if (!draft) return
    const text = `Subject: ${draft.subject}\n\n${draft.body}`
    await navigator.clipboard.writeText(text)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Follow-up email draft</SheetTitle>
        </SheetHeader>

        {!draft ? (
          <div className="py-6 text-sm text-muted-foreground">No draft loaded.</div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Subject</label>
              <Input value={draft.subject} readOnly />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Body</label>
              <Textarea value={draft.body} readOnly className="min-h-[260px]" />
            </div>

            <div className="flex gap-2">
              <Button onClick={copyAll}>Copy</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
