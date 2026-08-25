"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, XCircle, Target, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface QualityIssue {
  severity: string
  field: string
  message: string
}

interface QualityResult {
  score: number
  summary: string
  issues: QualityIssue[]
  strengths: string[]
  risk_areas: string[]
  passed: boolean
}

interface ProposalQualityCheckerProps {
  result: QualityResult | null
  loading?: boolean
  onRunCheck?: () => void
}

const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  high: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
  medium: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  low: { icon: AlertTriangle, color: "text-indigo-400", bg: "bg-indigo-500/10" },
}

const ProposalQualityChecker = memo(function ProposalQualityChecker({ result, loading, onRunCheck }: ProposalQualityCheckerProps) {
  if (loading) {
    return (
      <Card className="bg-zinc-900/80 border-zinc-800/50">
        <CardContent className="p-5 flex items-center justify-center h-24">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-zinc-400">Analyzing proposal quality...</span>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Button variant="outline" size="sm" onClick={onRunCheck} className="border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 h-9 text-xs">
        <Target className="w-3.5 h-3.5 mr-1.5" /> Check Quality
      </Button>
    )
  }

  return (
    <Card className={cn("border overflow-hidden", result.passed ? "border-emerald-500/20" : "border-amber-500/20")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", result.passed ? "bg-emerald-500/10" : "bg-amber-500/10")}>
              {result.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-white">Quality Check</p>
              <p className={cn("text-xs font-bold", result.passed ? "text-emerald-400" : "text-amber-400")}>{result.score}%</p>
            </div>
          </div>
          {!result.passed && onRunCheck && (
            <Button variant="ghost" size="sm" onClick={onRunCheck} className="text-xs text-indigo-400 h-7 px-2">
              Recheck <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-3">{result.summary}</p>

        {result.issues.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {result.issues.map((issue, i) => {
              const cfg = severityConfig[issue.severity] || severityConfig.low
              const Icon = cfg.icon
              return (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", cfg.color)} />
                  <span className="text-zinc-400">{issue.message}</span>
                </div>
              )
            })}
          </div>
        )}

        {result.strengths.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {result.strengths.map((s, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-400 border-emerald-500/20">
                {s.replace("_", " ")}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export { ProposalQualityChecker }
export type { QualityResult, QualityIssue }
