"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"
import {
  Bot,
  Play,
  Loader2,
  CheckCircle2,
  Globe,
  Mail,
  RefreshCw,
  Send,
  Users,
  AlertTriangle,
} from "lucide-react"

type Summary = {
  found: number
  new: number
  updated: number
  enrolled_now: number
  already_enrolled: number
  note?: string
}

type EnrichResult = {
  targets_remaining: number
  enriched: number
  verified: number
}

type StatusItem = {
  id: string
  company: string
  title: string
  email: string
  sendable: boolean
  enrolled: boolean
  current_step: number
  status: string
}

type Status = {
  companies: number
  with_valid_email: number
  enrolled: number
  items: StatusItem[]
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
      <div className={`text-2xl font-bold ${accent || "text-white"}`}>{value}</div>
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mt-1">{label}</div>
    </div>
  )
}

export function WeWorkAgentPanel() {
  const [running, setRunning] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    try {
      const s = await api.outreach.weworkAgentStatus()
      setStatus(s)
    } catch {
      setStatus(null)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleRun = useCallback(async () => {
    setRunning(true)
    setError(null)
    setSummary(null)
    try {
      const res = await api.outreach.weworkAgentRun(20)
      if (res && res.ok === false) {
        setError(res.error || "Agent run failed")
      } else {
        setSummary(res?.summary || null)
      }
    } catch (e: any) {
      setError(e?.message || "Agent run failed")
    } finally {
      setRunning(false)
      loadStatus()
    }
  }, [loadStatus])

  const handleEnrich = useCallback(async () => {
    setEnriching(true)
    setError(null)
    try {
      const res = await api.outreach.weworkAgentEnrich(4)
      setEnrichResult(res)
    } catch (e: any) {
      setError(e?.message || "Enrichment failed")
    } finally {
      setEnriching(false)
      loadStatus()
    }
  }, [loadStatus])

  const readyCount = status?.with_valid_email ?? 0
  const enrolledCount = status?.enrolled ?? 0

  return (
    <Card className="bg-zinc-900/60 border-white/[0.06] animate-fade-in-up" style={{ animationDelay: "150ms" }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-rose-500/20 border border-indigo-500/20">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              WeWorkRemotely Client Agent
              <Badge variant="outline" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/30 ml-1">
                LIVE
              </Badge>
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              Discovers companies actively hiring on WeWorkRemotely, resolves a real company email, and
              auto-enrolls them into the automated 4-step outreach cadence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleEnrich}
              disabled={enriching || running}
              className="border-white/[0.08] text-zinc-300 h-10"
              title="Resolve verify-able company emails for a small batch now"
            >
              {enriching ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enriching...</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" />Enrich batch</>
              )}
            </Button>
            <Button
              onClick={handleRun}
              disabled={running}
              className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold"
            >
              {running ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Agent running...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" />Run Agent</>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={loadStatus} className="border-white/[0.08] text-zinc-400" title="Refresh status">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Companies" value={status?.companies ?? "—"} accent="text-white" />
          <Stat label="New This Run" value={summary?.new ?? "—"} accent="text-emerald-400" />
          <Stat label="Valid Emails" value={running ? "…" : readyCount} accent="text-emerald-400" />
          <Stat label="Enrolled" value={running ? "…" : (summary?.enrolled_now ?? enrolledCount)} accent="text-indigo-400" />
          <Stat label="Needs Email" value={status ? (status.companies - readyCount) : "—"} accent="text-amber-400" />
        </div>

        {enrichResult && (
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
            <div className="flex items-center gap-2 font-medium mb-1">
              <Mail className="w-4 h-4" /> Enrichment complete
            </div>
            <p className="text-xs text-zinc-400">
              {enrichResult.enriched} addresses resolved ({enrichResult.verified} fully verified) ·{" "}
              {enrichResult.targets_remaining} clients still need an email (the daily cron keeps enriching).
            </p>
          </div>
        )}

        {summary && !enrichResult && (
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
            <div className="flex items-center gap-2 font-medium mb-1">
              <CheckCircle2 className="w-4 h-4" /> Agent run complete
            </div>
            <p className="text-xs text-zinc-400">
              {summary.found} clients found · {summary.new} new · {summary.updated} updated ·{" "}
              {summary.enrolled_now} newly enrolled · {summary.already_enrolled} already enrolled.{" "}
              {summary.note}
            </p>
          </div>
        )}

        {status && status.items.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" /> Qualified client companies
            </div>
            <ScrollArea className="h-56 rounded-xl border border-white/[0.06]">
              <div className="divide-y divide-white/[0.04]">
                {status.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`p-1.5 rounded-lg ${it.sendable ? "bg-emerald-500/10" : "bg-zinc-500/10"}`}>
                      {it.sendable ? (
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{it.company}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{it.title || "—"}</div>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate max-w-[180px] hidden sm:block">
                      {it.email || "no email"}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 shrink-0 ${
                        it.enrolled && it.sendable
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/30"
                      }`}
                    >
                      {it.enrolled && it.sendable ? "READY" : "PENDING"}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-zinc-600">
          <Send className="w-3 h-3" />
          "Run Agent" discovers + enrolls. The daily cron (09:00 UTC) then enriches each client&apos;s
          company email and runs the Day 0 / 3 / 7 / 14 outreach cadence (email + LinkedIn) — no valid
          email, no send.
        </div>
      </CardContent>
    </Card>
  )
}
