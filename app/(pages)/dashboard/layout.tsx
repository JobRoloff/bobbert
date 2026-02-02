import { SiteHeader } from "@/components/SiteHeader"
import { HeaderCtas } from "./HeaderCtas"

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader leftSlot={<h1>Dashboard</h1>} rightSlot={<HeaderCtas />} />
      {children}
    </>
  )
}
