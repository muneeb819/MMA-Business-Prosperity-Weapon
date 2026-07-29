"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application error:", error) }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-zinc-400 text-sm">An unexpected error occurred. The team has been notified.</p>
        {error.digest && <p className="text-[10px] text-zinc-600 font-mono">Error ID: {error.digest}</p>}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="border-zinc-800 hover:bg-zinc-800/50">
            <Home className="w-4 h-4 mr-2" /> Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
