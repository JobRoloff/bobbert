"use client"

import { syncJobEmails } from "@/app/actions/gmail/job-emails"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function FetchFromGemailButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleFetch() {
    setIsLoading(true)
    try {
      const emails = await syncJobEmails()
      setResult(emails)
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleFetch} disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch from Gmail"}
      </Button>
      {result && (
        <p className="mt-2 text-sm text-muted-foreground">
          Fetched {Array.isArray(result) ? result.length : 0} emails
        </p>
      )}
    </div>
  )
}
