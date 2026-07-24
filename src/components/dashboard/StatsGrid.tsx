"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Brain } from "lucide-react"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"

interface StatsGridProps {
  totalRevenue: number
  leadsCount: number
  conversionRate: number
}

const iconMap = {
  DollarSign,
  Users,
  Target,
  Brain,
} as const

const statsConfig = [
  {
    title: "Total Revenue",
    key: "totalRevenue" as const,
    format: "currency",
    change: 12.5,
    icon: "DollarSign" as const,
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    title: "Active Leads",
    key: "leadsCount" as const,
    format: "number",
    change: 8.2,
    icon: "Users" as const,
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
  {
    title: "Conversion Rate",
    key: "conversionRate" as const,
    format: "percent",
    change: -2.1,
    icon: "Target" as const,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    title: "AI Efficiency",
    key: "aiEfficiency" as const,
    format: "percent",
    change: 5.3,
    icon: "Brain" as const,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
] as const

function formatStatValue(value: number, format: string) {
  switch (format) {
    case "currency":
      return formatCurrency(value)
    case "percent":
      return `${value}%`
    default:
      return formatNumber(value)
  }
}

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
      {statsConfig.map((stat) => {
        const Icon = iconMap[stat.icon]
        return (
          <Card
            key={stat.title}
            className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0 flex-1">
                  <p className="text-sm text-zinc-400 font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight whitespace-nowrap">
                    {formatStatValue(values[stat.key], stat.format)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {stat.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        stat.change >= 0 ? "text-emerald-400" : "text-red-400"
                      )}
                    >
                      {stat.change >= 0 ? "+" : ""}
                      {stat.change}%
                    </span>
                    <span className="text-xs text-zinc-500">vs last month</span>
                  </div>
                </div>
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-lg shrink-0",
                    stat.gradient,
                    stat.glow
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
})

export { StatsGrid }
