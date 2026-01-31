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


export default function Home() {

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1>// For Stuff like API key input</h1>
          <div className="grid mb-6 gap-2 grid-cols-2">
            <>form component here</>
          </div>
        </div>
      </div>
    </div>
  )
}
