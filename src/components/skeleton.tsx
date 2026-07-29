"use client"

import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: { className?: string; [key: string]: any }) {
  return <div className={cn("animate-pulse rounded-lg bg-zinc-800/50", className)} {...props} />
}

export function WidgetSkeleton({ type = "card" }: { type?: "card" | "chart" | "list" | "briefing" }) {
  if (type === "briefing") {
    return (
      <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    )
  }

  if (type === "chart") {
    return (
      <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  )
}
