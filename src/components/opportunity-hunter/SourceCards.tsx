"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Pause, Play, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Source } from "./types"

function PulseDot({ status, className = "" }: { status: string; className?: string }) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-amber-500",
    offline: "bg-zinc-500",
    error: "bg-red-500",
    paused: "bg-zinc-500",
    scanning: "bg-cyan-500",
    analyzing: "bg-cyan-500",
    generating: "bg-cyan-500",
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

interface SourceCardsProps {
  sources: Source[]
  sourceStatuses: Record<string, string>
  onToggleStatus: (id: string) => void
  onSelectSource: (source: Source) => void
}

function SourceCardsInner({
  sources,
  sourceStatuses,
  onToggleStatus,
  onSelectSource,
}: SourceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source) => (
        <Card
          key={source.id}
          className="card-hover glass border-zinc-800/50 bg-zinc-900/80 group overflow-hidden relative"
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
              source.gradient
            )}
          />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0",
                    source.gradient
                  )}
                >
                  <source.icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold group-hover:text-white transition-colors truncate">
                    {source.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PulseDot
                      status={sourceStatuses[source.id] || source.status}
                      className="!h-1.5 !w-1.5"
                    />
                    <span className="text-xs text-zinc-500 capitalize">
                      {sourceStatuses[source.id] || source.status}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-zinc-800/50 text-zinc-400 shrink-0 ml-2"
              >
                {source.leadsFound} leads
              </Badge>
            </div>

            <p className="text-xs text-zinc-500 mb-4 line-clamp-2">
              {source.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Accuracy</span>
                <span className="font-medium">{source.metrics.accuracy}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${source.metrics.accuracy}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {source.lastScan}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  onClick={() => onToggleStatus(source.id)}
                >
                  {sourceStatuses[source.id] === "active" ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  onClick={() => onSelectSource(source)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const SourceCards = memo(SourceCardsInner)
