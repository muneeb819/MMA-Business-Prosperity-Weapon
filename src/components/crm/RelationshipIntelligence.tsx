"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, MessageSquare, Users, Briefcase, Clock, ArrowRight } from "lucide-react"
import { cn, timeAgo } from "@/lib/utils"
import Link from "next/link"

interface RelationshipItem {
  type: "proposal" | "conversation" | "project" | "contact" | "meeting"
  title: string
  date: string
  description?: string
  link?: string
}

interface RelationshipIntelligenceProps {
  companyName: string
  items: RelationshipItem[]
  loading?: boolean
}

const itemConfig: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  proposal: { icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  conversation: { icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
  project: { icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  contact: { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  meeting: { icon: Clock, color: "text-violet-400", bg: "bg-violet-500/10" },
}

const RelationshipIntelligence = memo(function RelationshipIntelligence({
  companyName, items, loading,
}: RelationshipIntelligenceProps) {
  if (loading) {
    return (
      <Card className="bg-zinc-900/80 border-zinc-800/50">
        <CardContent className="p-4 flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-zinc-400">Loading relationship data...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/80 border-zinc-800/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Relationship Intelligence</h3>
            <p className="text-xs text-zinc-500">{companyName}</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, i) => {
              const cfg = itemConfig[item.type] || itemConfig.contact
              const Icon = cfg.icon
              return (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-zinc-800/30 transition-colors group">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{item.title}</span>
                      <Badge variant="outline" className={cn("text-[9px] font-medium border", cfg.bg, cfg.color)}>
                        {item.type}
                      </Badge>
                    </div>
                    {item.description && <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-600">{timeAgo(new Date(item.date))}</span>
                    </div>
                  </div>
                  {item.link && (
                    <Link href={item.link} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-4">No previous relationship data for this company</p>
        )}
      </CardContent>
    </Card>
  )
})

export { RelationshipIntelligence }
export type { RelationshipItem }
