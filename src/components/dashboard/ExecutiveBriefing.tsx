"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, AlertTriangle, Target, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface BriefingRecommendation {
  title: string
  reason: string
  expected_revenue: number
  probability: number
  suggested_action: string
}

interface BriefingData {
  summary: string
  total_opportunities: number
  high_priority_count: number
  expiring_count: number
  top_recommendations: BriefingRecommendation[]
}

interface ExecutiveBriefingProps {
  briefing: BriefingData | null
  loading?: boolean
  onViewAll?: () => void
}

const ExecutiveBriefing = memo(function ExecutiveBriefing({ briefing, loading, onViewAll }: ExecutiveBriefingProps) {
  if (loading) {
    return (
      <Card className="bg-zinc-900/80 border-zinc-800/50 overflow-hidden">
        <CardContent className="p-5 flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-zinc-400">Generating briefing...</span>
        </CardContent>
      </Card>
    )
  }

  if (!briefing) return null

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border-cyan-500/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Executive Briefing</h2>
              <p className="text-xs text-zinc-500">Today&apos;s overview</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-cyan-400 hover:text-cyan-300 h-8">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-4">{briefing.summary}</p>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-medium px-3 py-1">
            <Target className="w-3 h-3 mr-1.5" />{briefing.total_opportunities} Opportunities
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-medium px-3 py-1">
            <TrendingUp className="w-3 h-3 mr-1.5" />{briefing.high_priority_count} High Priority
          </Badge>
          {briefing.expiring_count > 0 && (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-medium px-3 py-1">
              <Clock className="w-3 h-3 mr-1.5" />{briefing.expiring_count} Expiring
            </Badge>
          )}
        </div>

        {briefing.top_recommendations?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Recommendations</h3>
            {briefing.top_recommendations.map((rec, i) => (
              <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50")}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{rec.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{rec.reason}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                    <span>${(rec.expected_revenue || 0).toLocaleString()}</span>
                    <span className={cn(rec.probability > 70 ? "text-emerald-400" : "text-amber-400")}>{rec.probability}%</span>
                    <span>{rec.suggested_action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export { ExecutiveBriefing }
export type { BriefingData, BriefingRecommendation }
