"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { cn, timeAgo } from "@/lib/utils"
import { Search, Brain, FileText, Send, MessageSquare, Handshake, TrendingUp, TrendingDown, Clock } from "lucide-react"

interface TimelineStage {
  stage: string
  label: string
  date?: string
  completed: boolean
  details?: string
}

interface OpportunityTimelineProps {
  stages: TimelineStage[]
  compact?: boolean
}

const stageConfig: Record<string, { icon: typeof Search; color: string }> = {
  discovered: { icon: Search, color: "text-blue-400" },
  analyzing: { icon: Brain, color: "text-violet-400" },
  proposal: { icon: FileText, color: "text-cyan-400" },
  submitted: { icon: Send, color: "text-emerald-400" },
  interview: { icon: MessageSquare, color: "text-amber-400" },
  negotiation: { icon: Handshake, color: "text-purple-400" },
  won: { icon: TrendingUp, color: "text-emerald-400" },
  lost: { icon: TrendingDown, color: "text-rose-400" },
}

const OpportunityTimeline = memo(function OpportunityTimeline({ stages, compact }: OpportunityTimelineProps) {
  const currentIdx = stages.findIndex((s) => !s.completed)

  return (
    <div className={cn("space-y-0", compact && "space-y-0")}>
      {stages.map((stage, i) => {
        const cfg = stageConfig[stage.stage] || { icon: Clock, color: "text-zinc-500" }
        const Icon = cfg.icon
        const isActive = i === currentIdx
        const isPast = stage.completed
        const isLast = i === stages.length - 1

        return (
          <div key={stage.stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
                isPast ? "bg-emerald-500/10 border-emerald-500/40" : isActive ? "bg-cyan-500/10 border-cyan-400" : "bg-zinc-800/50 border-zinc-700/50"
              )}>
                {isPast ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                ) : (
                  <Icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-zinc-600")} />
                )}
              </div>
              {!isLast && <div className={cn("w-0.5 h-8", isPast ? "bg-emerald-500/20" : "bg-zinc-800/50")} />}
            </div>
            <div className={cn("pb-6 min-w-0 flex-1", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isPast ? "text-emerald-300" : isActive ? "text-cyan-300" : "text-zinc-500"
                )}>
                  {stage.label}
                </span>
                {stage.date && (
                  <span className="text-[10px] text-zinc-600">{timeAgo(new Date(stage.date))}</span>
                )}
                {isActive && (
                  <Badge variant="outline" className="text-[9px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-1.5 py-0">
                    Current
                  </Badge>
                )}
              </div>
              {stage.details && (
                <p className="text-xs text-zinc-500 mt-0.5">{stage.details}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})

export { OpportunityTimeline }
export type { TimelineStage }
