// /app/(pages)/dashboard/page.tsx

import { getTodosToDraft } from "@/services/followupDrafts"
import { FollowUpsList } from "./FollowUpsList"
import { TodosButton } from "./sync-button"

export default async function Page() {
  const todos = await getTodosToDraft({ channel: "EMAIL" })

  return (
    <>
      <div className="flex items-center justify-between">
        <h2>ToDo&apos;s</h2>
        {/* <TodosButton /> */}
      </div>

      <FollowUpsList todos={todos} />
    </>
  )
}
