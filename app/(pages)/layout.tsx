import type { Metadata } from "next"
import "../styles/globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"


export const metadata: Metadata = {
  title: "Form to RCS - RCS Messaging Demo",
  description: "Transform form submissions into rich RCS messages via Twilio",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              {/* <SiteHeader /> */}
              <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
          </SidebarProvider>
  )
}
