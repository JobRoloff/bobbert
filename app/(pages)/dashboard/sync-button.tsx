// /app/(pages)/dashboard/sync-button.tsx

"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { seedFollowUpTodos } from "@/app/actions/followup/seed"

export function TodosButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleFetch() {
    setIsLoading(true)
    try {
      await seedFollowUpTodos({ days: 3 })
      router.refresh() // re-runs server components on the route
    } catch (error) {
      console.error("Error syncing todos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleFetch} disabled={isLoading}>
        {isLoading ? "Loading..." : "Sync ToDo's"}
      </Button>
    </div>
  )
}
