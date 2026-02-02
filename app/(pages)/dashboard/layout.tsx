import { SiteHeader } from "@/components/SiteHeader"
import { HeaderCtas } from "./HeaderCtas"

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader leftSlot={<h1>Your data summaries</h1>} rightSlot={<HeaderCtas />} />
      {children}
    </>
  )
}
