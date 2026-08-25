"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, CheckCircle, Zap, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent } from "@/lib/types"

function PulseDot({
  status,
  className = "",
}: {
  status: string
  className?: string
}) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-amber-500",
    offline: "bg-zinc-500",
    error: "bg-red-500",
    searching: "bg-indigo-500",
    scanning: "bg-indigo-500",
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
      <span
        className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  )
}

interface AgentFleetProps {
  agents: Agent[]
  activeAgentTab: "all" | "active" | "idle"
  isExpanded: boolean
  onTabChange: (tab: "all" | "active" | "idle") => void
  onToggleExpanded: (expanded: boolean) => void
  onAgentClick: (agentName: string) => void
}

const AgentFleet = React.memo(function AgentFleet({
  agents,
  activeAgentTab,
  isExpanded,
  onTabChange,
  onToggleExpanded,
  onAgentClick,
}: AgentFleetProps) {
  const filteredAgents = agents.filter((agent) => {
    if (activeAgentTab === "active") {
      return (
        agent.status === "scanning" ||
        agent.status === "analyzing" ||
        agent.status === "generating"
      )
    }
    if (activeAgentTab === "idle") {
      return agent.status === "idle" || agent.status === "paused"
    }
    return true
  })

  const activeCount = agents.filter(
    (a) =>
      a.status === "scanning" ||
      a.status === "analyzing" ||
      a.status === "generating"
  ).length

  const tabs = [
    { id: "all" as const, label: "All", activeClass: "bg-zinc-700 hover:bg-zinc-600" },
    { id: "active" as const, label: "Active", activeClass: "bg-emerald-600 hover:bg-emerald-500" },
    { id: "idle" as const, label: "Idle", activeClass: "bg-amber-600 hover:bg-amber-500" },
  ]

  return (
    <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-600 shadow-lg shadow-indigo-500/20 shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">AI Agent Fleet</CardTitle>
              <CardDescription>
                {activeCount} of {agents.length} agents active
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeAgentTab === tab.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "text-xs h-7 px-2",
                  activeAgentTab === tab.id
                    ? tab.activeClass
                    : "text-zinc-400 hover:text-white"
                )}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAgents
            .slice(0, isExpanded ? undefined : 4)
            .map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 overflow-hidden",
                  "bg-zinc-800/30 border-zinc-800/50 hover:border-zinc-700/50",
                  "hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-zinc-900/50",
                  "group cursor-pointer"
                )}
                onClick={() => onAgentClick(agent.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PulseDot status={agent.status} className="shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {agent.name}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs shrink-0 ml-2",
                      agent.status === "scanning" ||
                        agent.status === "analyzing" ||
                        agent.status === "generating"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : agent.status === "idle"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {agent.currentTask || "No active task"}
                </p>
                {(agent.status === "scanning" ||
                  agent.status === "analyzing" ||
                  agent.status === "generating") && (
                  <div className="mt-2 text-xs text-indigo-400 font-medium flex items-center gap-1">
                    <span>Working</span>
                    <TypingDots />
                  </div>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {agent.tasksCompleted} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {agent.efficiency}%
                  </span>
                </div>
              </div>
            ))}
        </div>
        {filteredAgents.length > 4 && !isExpanded && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-400 hover:text-indigo-300 text-xs"
              onClick={() => onToggleExpanded(true)}
            >
              Show all {filteredAgents.length} agents{" "}
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
        {isExpanded && filteredAgents.length > 4 && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white text-xs"
              onClick={() => onToggleExpanded(false)}
            >
              Show less
            </Button>
          </div>
        )}
        {filteredAgents.length === 0 && (
          <p className="text-center text-sm text-zinc-500 py-8">
            No agents match this filter.
          </p>
        )}
      </CardContent>
    </Card>
  )
})

export { AgentFleet, PulseDot }
