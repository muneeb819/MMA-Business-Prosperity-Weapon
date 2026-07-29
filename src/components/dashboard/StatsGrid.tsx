"use client"

import React from "react"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Brain, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/tooltip-wrapper"
import { AnimatedCounter } from "@/components/animated-counter"
import { GlassCard } from "@/components/glass-card"
import { FadeIn, StaggerItem } from "@/components/page-transition"

interface StatsGridProps {
  totalRevenue: number
  leadsCount: number
  conversionRate: number
}

const statsConfig = [
  {
    title: "Total Revenue",
    key: "totalRevenue" as const,
    format: "currency",
    change: 12.5,
    icon: DollarSign,
    glow: "emerald" as const,
    tooltip: "Total revenue generated from all won proposals across all time periods.",
  },
  {
    title: "Active Leads",
    key: "leadsCount" as const,
    format: "number",
    change: 8.2,
    icon: Users,
    glow: "blue" as const,
    tooltip: "Number of leads currently in active status.",
  },
  {
    title: "Conversion Rate",
    key: "conversionRate" as const,
    format: "percent",
    change: -2.1,
    icon: Target,
    glow: "purple" as const,
    tooltip: "Percentage of leads that convert to won deals.",
  },
  {
    title: "AI Efficiency",
    key: "aiEfficiency" as const,
    format: "percent",
    change: 5.3,
    icon: Brain,
    glow: "emerald" as const,
    tooltip: "Overall AI agent efficiency score based on task completion rate.",
  },
] as const

const StatsGrid = React.memo(function StatsGrid({
  totalRevenue,
  leadsCount,
  conversionRate,
}: StatsGridProps) {
  const values: Record<string, number> = {
    totalRevenue,
    leadsCount,
    conversionRate,
    aiEfficiency: 94.7,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat, i) => {
        const Icon = stat.icon
        const val = values[stat.key]
        const displayVal = stat.format === "currency" ? val : val
        return (
          <StaggerItem key={stat.title}>
            <GlassCard glow={stat.glow}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-white/40 font-medium truncate">{stat.title}</p>
                      <Tooltip content={stat.tooltip} side="top">
                        <Info className="w-3 h-3 text-white/20 hover:text-white/40 cursor-help transition-colors shrink-0" />
                      </Tooltip>
                    </div>
                    <p className="text-3xl font-bold tracking-tight text-white">
                      {stat.format === "currency" && "$"}
                      <AnimatedCounter end={displayVal} decimals={0} />
                      {stat.format === "percent" && "%"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {stat.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className={cn("text-sm font-medium", stat.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {stat.change >= 0 ? "+" : ""}{stat.change}%
                      </span>
                      <span className="text-xs text-white/30">vs last month</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.06] shrink-0">
                    <Icon className="w-5 h-5 text-white/60" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        )
      })}
    </div>
  )
})

export { StatsGrid }
