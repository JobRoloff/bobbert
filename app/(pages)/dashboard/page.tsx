import { getTodosToDraft } from "@/services/followupDrafts"
import { FollowUpsList } from "./FollowUpsList"

export default async function Page() {
  const todos = await getTodosToDraft({ channel: "EMAIL" })

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <h2 className="text-[--md-sys-color-primary]">It's been a while, touch bases with the following:</h2>
      </div>
      <FollowUpsList todos={todos} />
    </>
  )
}
