"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Shield, Lock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AuthGuard({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-600 animate-pulse opacity-50" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-rose-600 to-rose-500 text-white font-bold text-2xl">M</div>
          </div>
          <p className="text-zinc-400 text-sm animate-pulse">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 animate-pulse" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 text-white">
              <Lock className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Session Required</h1>
          <p className="text-zinc-400">Please log in to access this page.</p>
          <Button onClick={() => router.push("/login")} className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white shadow-lg shadow-indigo-500/20">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  if (requiredRole && user && user.role !== requiredRole && user.role !== "superadmin") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/20">
              <Shield className="w-10 h-10 text-rose-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-zinc-400">You don&apos;t have permission to view this page. Required role: <span className="text-indigo-400 font-medium">{requiredRole}</span></p>
          <Button variant="outline" onClick={() => router.push("/")} className="border-zinc-800 hover:bg-zinc-800/50">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
