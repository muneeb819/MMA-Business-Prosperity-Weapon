"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type ApiStatus = "checking" | "online" | "offline"

/**
 * Live backend health check.
 *
 * Replaces hardcoded "All systems operational" claims with an actual probe:
 * any sub-500, non-404 response from the API means the backend process is
 * serving requests (405 on GET /api/auth/login is the healthy case, since
 * the route only accepts POST). A 500 or network failure means it is not.
 */
export function useApiStatus(intervalMs = 30000): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("checking")

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const res = await fetch("/api/auth/login", { method: "GET", cache: "no-store" })
        if (cancelled) return
        setStatus(res.status !== 404 && res.status < 500 ? "online" : "offline")
      } catch {
        if (!cancelled) setStatus("offline")
      }
    }

    void check()
    const timer = setInterval(() => {
      void check()
    }, intervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [intervalMs])

  return status
}

const LABELS: Record<ApiStatus, string> = {
  checking: "Checking API…",
  online: "API online",
  offline: "API offline",
}

const DOT_COLORS: Record<ApiStatus, string> = {
  checking: "bg-zinc-500",
  online: "bg-emerald-500",
  offline: "bg-red-500",
}

/** Status dot + label, for footers and sidebars. */
export function ApiStatusDot({ className }: { className?: string }) {
  const status = useApiStatus()
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", DOT_COLORS[status])} />
      {LABELS[status]}
    </span>
  )
}

/** Bare status dot only (collapsed sidebar state). */
export function ApiStatusIndicator({ className }: { className?: string }) {
  const status = useApiStatus()
  return (
    <span
      className={cn("block h-1.5 w-1.5 rounded-full animate-pulse", DOT_COLORS[status], className)}
      title={LABELS[status]}
    />
  )
}
