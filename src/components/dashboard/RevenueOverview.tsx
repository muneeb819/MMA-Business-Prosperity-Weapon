"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ChevronRight } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

interface RevenueItem {
  label: string
  value: number
  max: number
}

interface RevenueOverviewProps {
  revenueData: RevenueItem[]
  showDetails: boolean
  onToggleDetails: () => void
}

const RevenueOverview = React.memo(function RevenueOverview({
  revenueData,
  showDetails,
  onToggleDetails,
}: RevenueOverviewProps) {
  return (
    <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
              <CardDescription>
                Quarterly performance breakdown
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white shrink-0"
            onClick={onToggleDetails}
          >
            {showDetails ? "Hide" : "Details"}{" "}
            <ChevronRight
              className={cn(
                "w-4 h-4 ml-1 transition-transform",
                showDetails && "rotate-90"
              )}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="space-y-4">
          {revenueData.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">{item.label}</span>
                <span className="font-medium whitespace-nowrap">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-1000 ease-out"
                  style={{
                    width: `${(item.value / item.max) * 100}%`,
                    animationDelay: `${800 + index * 200}ms`,
                  }}
                />
              </div>
              {showDetails && (
                <div className="flex items-center justify-between text-xs text-zinc-500 pl-1">
                  <span>
                    {Math.round((item.value / item.max) * 100)}% of target (
                    {formatCurrency(item.max)})
                  </span>
                  <span
                    className={cn(
                      index === 0
                        ? "text-emerald-400"
                        : index === 1
                          ? "text-amber-400"
                          : "text-zinc-400"
                    )}
                  >
                    {index === 0
                      ? "On track"
                      : index === 1
                        ? "Below target"
                        : "Needs attention"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
            <span className="text-sm text-zinc-400">Total Annual Revenue</span>
            <span className="text-lg font-bold">
              {formatCurrency(
                revenueData.reduce((sum, d) => sum + d.value, 0)
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export { RevenueOverview }
