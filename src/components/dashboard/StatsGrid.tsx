"use client"

import React from "react"
import { DollarSign, Users, Target, Brain, Info } from "lucide-react"
import { Tooltip } from "@/components/tooltip-wrapper"
import { AnimatedCounter } from "@/components/animated-counter"
import { GlassCard } from "@/components/glass-card"
import {  StaggerItem } from "@/components/page-transition"

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
    icon: DollarSign,
    glow: "emerald" as const,
    tooltip: "Total revenue generated from all won proposals across all time periods.",
  },
  {
    title: "Active Leads",
    key: "leadsCount" as const,
    format: "number",
    icon: Users,
    glow: "blue" as const,
    tooltip: "Number of leads currently in active status.",
  },
  {
    title: "Conversion Rate",
    key: "conversionRate" as const,
    format: "percent",
    icon: Target,
    glow: "purple" as const,
    tooltip: "Percentage of leads that convert to won deals.",
  },
  {
    title: "AI Efficiency",
    key: "aiEfficiency" as const,
    format: "percent",
    icon: Brain,
    glow: "emerald" as const,
    tooltip: "Completed agent tasks as a share of all tasks — shown once agent logs are available.",
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
    aiEfficiency: 0,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => {
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
