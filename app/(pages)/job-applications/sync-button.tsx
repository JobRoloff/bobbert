"use client"

import { syncJobEmails } from "@/app/actions/gmail/job-emails"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function FetchFromGemailButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleFetch() {
    setIsLoading(true)
    try {
      const emails = await syncJobEmails()
      setIsLoading(true)
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

    </div>
  )
}
