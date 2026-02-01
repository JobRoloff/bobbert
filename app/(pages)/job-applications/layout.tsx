import { SiteHeader } from "@/components/SiteHeader"
import { HeaderCtas } from "./HeaderCtas"

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader rightSlot={<HeaderCtas />} />
      {children}
    </>
  )
}
