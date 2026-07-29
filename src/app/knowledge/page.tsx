"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import { BookOpen, FileText, TrendingUp, AlertCircle, Clock, Search, Plus, X, Check, Loader2 } from "lucide-react"
import { cn, timeAgo } from "@/lib/utils"
import { api } from "@/lib/api"
import type { KnowledgeEntry } from "@/lib/types"

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof BookOpen }> = {
  playbook: { label: "Playbook", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: BookOpen },
  industry_knowledge: { label: "Industry Knowledge", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: FileText },
  past_win: { label: "Past Win", color: "text-blue-400", bg: "bg-blue-500/10", icon: TrendingUp },
  past_loss: { label: "Past Loss", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertCircle },
  client_history: { label: "Client History", color: "text-violet-400", bg: "bg-violet-500/10", icon: Clock },
}

export default function KnowledgePage() {
  useEffect(() => { document.title = "Knowledge Base | MBPW"; }, [])
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      try {
        const data = await api.knowledge.list({ limit: "100" })
        if (!cancelled && Array.isArray(data)) {
          setEntries(data as KnowledgeEntry[])
        }
      } catch { /* keep empty */ }
      if (!cancelled) setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (typeFilter !== "all" && e.entryType !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))
      }
      return true
    })
  }, [entries, typeFilter, search])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => { counts[e.entryType] = (counts[e.entryType] || 0) + 1 })
    return counts
  }, [entries])

  const allTypes = Object.keys(typeConfig)

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
                        <Breadcrumbs />
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-slate-700/50 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Knowledge Base</h1>
                  <p className="text-sm text-slate-500">Playbooks, industry insights, past wins &amp; losses</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search knowledge base..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#12121a] border-slate-800/50 text-white placeholder:text-slate-700 h-10 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setTypeFilter("all")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", typeFilter === "all" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-[#12121a] text-slate-400 border border-slate-800/50 hover:border-slate-700/50")}>All ({entries.length})</button>
                {allTypes.map((t) => (
                  <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", typeFilter === t ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-[#12121a] text-slate-400 border border-slate-800/50 hover:border-slate-700/50")}>
                    {typeConfig[t]?.label || t} ({typeCounts[t] || 0})
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="ml-3 text-sm text-slate-500">Loading knowledge base...</span>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((entry) => {
                  const cfg = typeConfig[entry.entryType] || typeConfig.playbook
                  const Icon = cfg.icon
                  return (
                    <Card
                      key={entry.id}
                      onClick={() => setSelected(selected?.id === entry.id ? null : entry)}
                      className={cn(
                        "bg-[#12121a] border-slate-800/50 hover:border-slate-700/50 transition-all cursor-pointer overflow-hidden",
                        selected?.id === entry.id && "border-cyan-500/40 ring-1 ring-cyan-500/20"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                            <Icon className={cn("w-4 h-4", cfg.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">{entry.title}</h3>
                            <Badge variant="outline" className={cn("text-[10px] font-medium border mt-1", cfg.bg, cfg.color)}>
                              {cfg.label}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{entry.content.replace(/[#*\n]/g, " ").slice(0, 200)}</p>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {entry.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-500">{tag}</span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <BookOpen className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">No entries found</p>
                <p className="text-sm mt-1">Try a different search or filter</p>
              </div>
            )}

            {selected && (
              <Card className="bg-[#12121a] border-cyan-500/20 ring-1 ring-cyan-500/10 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", (typeConfig[selected.entryType] || typeConfig.playbook).bg)}>
                        {(() => { const Icon = (typeConfig[selected.entryType] || typeConfig.playbook).icon; return <Icon className={cn("w-5 h-5", (typeConfig[selected.entryType] || typeConfig.playbook).color)} /> })()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{selected.title}</h2>
                        <Badge variant="outline" className={cn("text-[11px] font-medium border mt-1", (typeConfig[selected.entryType] || typeConfig.playbook).bg, (typeConfig[selected.entryType] || typeConfig.playbook).color)}>
                          {(typeConfig[selected.entryType] || typeConfig.playbook).label}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="text-slate-500 hover:text-white h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                    {selected.content}
                  </div>
                  {selected.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/50">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-400">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
                    {selected.source && <span>Source: {selected.source}</span>}
                    {selected.createdAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(new Date(selected.createdAt))}</span>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
                  <Footer />
          </main>
      </div>
    </div>
  )
}
