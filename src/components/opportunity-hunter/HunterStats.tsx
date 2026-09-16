"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, CheckCircle, Zap, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Source } from "./types"

function PulseDot({ status, className = "" }: { status: string; className?: string }) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-amber-500",
    offline: "bg-zinc-500",
    error: "bg-red-500",
    paused: "bg-zinc-500",
    scanning: "bg-indigo-500",
    analyzing: "bg-indigo-500",
    generating: "bg-indigo-500",
  } as const

  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          colors[status as keyof typeof colors] || colors.offline
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          colors[status as keyof typeof colors] || colors.offline
        )}
      />
    </span>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1">
      <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  )
}

interface HunterAgent {
  name: string
  currentTask?: string
  tasksCompleted: number
  efficiency: number
}

interface HunterStatsProps {
  isRunning: boolean
  hunterAgent: HunterAgent
  searchSources: Source[]
  sourceStatuses: Record<string, string>
  newDiscoveryCount: number
}

function HunterStatsInner({
  isRunning,
  hunterAgent,
  searchSources,
  sourceStatuses,
  newDiscoveryCount,
}: HunterStatsProps) {
  const totalLeads = searchSources.reduce((a, s) => a + s.leadsFound, 0)
  const activeSourceCount = Object.values(sourceStatuses).filter((s) => s === "active").length

  return (
    <Card
      className="card-hover glass border-zinc-800/50 bg-zinc-900/80 animate-fade-in-up overflow-hidden relative"
      style={{ animationDelay: "100ms" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-indigo-500/5 to-rose-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <PulseDot
                  status={isRunning ? "scanning" : "idle"}
                  className="!h-4 !w-4"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold truncate">{hunterAgent.name}</h3>
                {isRunning && <TypingDots />}
              </div>
              <p className="text-sm text-zinc-400 mt-1 truncate">
                {isRunning
                  ? hunterAgent.currentTask
                  : "Hunter is paused. Click start to resume."}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium">
                    {hunterAgent.tasksCompleted.toLocaleString()} tasks
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium">
                    {hunterAgent.efficiency}% efficiency
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-medium">
                    99.9% uptime
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 md:border-l md:border-zinc-800 md:pl-8 shrink-0">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-400">
                {totalLeads}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Total Leads</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">
                {activeSourceCount}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Active Sources</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-rose-400">
                {newDiscoveryCount}
              </p>
              <p className="text-xs text-zinc-500 mt-1">New Today</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const HunterStats = memo(HunterStatsInner)
