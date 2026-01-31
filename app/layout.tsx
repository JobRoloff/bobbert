import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./styles/globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Form to RCS - RCS Messaging Demo",
  description: "Transform form submissions into rich RCS messages via Twilio",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
        <div className="flex flex-1 flex-col">{children}</div>

        </ThemeProvider>
      </body>
    </html>
  )
}
