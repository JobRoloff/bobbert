"use client"

/**
 * In this page (/settings), we're looking to save some settings for the application
 *
 * To do this we need a couple of things:
 *
 * 1. A data shape representing the settings (e.g., Auth: demo token)
 *
 */

// use client because we're doing local storage stuff
import { Loader2, CheckCircle2, XCircle, Info, Cog, Lock } from "lucide-react"
import AuthForm from "@/components/form/Auth"

interface SendResponse {
  success: boolean
  requestId?: string
  messageSid?: string
  status?: string
  message?: string
  error?: string
  errorCode?: string
}

export default function Home() {

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1>// For Stuff like API key input</h1>
          <div className="grid mb-6 gap-2 grid-cols-2">
            <AuthForm/>
          </div>
        </div>
      </div>
    </div>
  )
}
