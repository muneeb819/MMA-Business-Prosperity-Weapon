"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import {
  Globe, Play, Pause, Settings, Sparkles, X, CheckCircle, Loader2,
  Mountain, Globe2, Laptop, Briefcase, Search as SearchIcon, Send,
} from "lucide-react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { fetchAllSources, getStoredLeads } from "@/lib/live-sources"
import { addNotification } from "@/lib/pipeline"
import { HunterStats } from "@/components/opportunity-hunter/HunterStats"
import { SourceCards } from "@/components/opportunity-hunter/SourceCards"
import { FilterBar } from "@/components/opportunity-hunter/FilterBar"
import { DiscoveryFeed } from "@/components/opportunity-hunter/DiscoveryFeed"
import { ConfigPanel } from "@/components/opportunity-hunter/ConfigPanel"
import { DetailDialogs } from "@/components/opportunity-hunter/DetailDialogs"
import {
  initialCategories, getStoredDiscoveries, storeDiscoveries,
  getStoredSourceStats, storeSourceStats, liveLeadToDiscovery,
} from "@/components/opportunity-hunter/types"
import type { Source, Discovery } from "@/components/opportunity-hunter/types"

type SourceMeta = Omit<Source, "status" | "leadsFound" | "lastScan">

const LIVE_SOURCE_MAP: Record<string, SourceMeta> = {
  himalayas: {
    id: "himalayas",
    name: "Himalayas",
    icon: Mountain,
    description: "Remote-first job board with verified companies, salary ranges and tech stacks",
    gradient: "from-emerald-500 to-rose-600",
    metrics: { accuracy: 96, speed: 92 },
  },
  remoteok: {
    id: "remoteok",
    name: "RemoteOK",
    icon: Globe2,
    description: "Live API feed of remote positions tagged by stack and salary",
    gradient: "from-red-500 to-orange-600",
    metrics: { accuracy: 94, speed: 95 },
  },
  remotive: {
    id: "remotive",
    name: "Remotive",
    icon: Laptop,
    description: "RSS feed of hand-screened remote jobs across all categories",
    gradient: "from-violet-500 to-purple-600",
    metrics: { accuracy: 93, speed: 88 },
  },
  weworkremotely: {
    id: "weworkremotely",
    name: "We Work Remotely",
    icon: Globe,
    description: "Largest remote work community RSS with tech-enriched listings",
    gradient: "from-blue-500 to-indigo-600",
    metrics: { accuracy: 95, speed: 90 },
  },
  arbeitnow: {
    id: "arbeitnow",
    name: "Arbeitnow",
    icon: Briefcase,
    description: "Germany/EU focused job board API with tags and remote flags",
    gradient: "from-amber-500 to-yellow-600",
    metrics: { accuracy: 91, speed: 94 },
  },
  findwork: {
    id: "findwork",
    name: "Findwork",
    icon: SearchIcon,
    description: "Curated job API ordered by date posted with role taxonomy",
    gradient: "from-cyan-500 to-sky-600",
    metrics: { accuracy: 92, speed: 89 },
  },
}

const SOURCE_KEYS = Object.keys(LIVE_SOURCE_MAP)

const OUTREACH_KEY = "mbpw_hunter_outreach"

interface OutreachRecord {
  id: string
  discoveryId: string
  company: string
  title: string
  proposal: any
  generatedAt: string
  status: string
  emailMethod?: string
  recipientEmail?: string
}

function getStoredOutreach(): OutreachRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(OUTREACH_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function storeOutreach(records: OutreachRecord[]) {
  localStorage.setItem(OUTREACH_KEY, JSON.stringify(records))
}

function formatScanTime(iso?: string): string {
  if (!iso) return "Never"
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return "Never"
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch { return "Never" }
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl shadow-zinc-900/50">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-sm text-zinc-100">{message}</p>
        <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function OpportunityHunterPage() {
  useEffect(() => { document.title = "Opportunity Hunter | MBPW"; }, [])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [categories, setCategories] = useState(initialCategories)
  const [searchFrequency, setSearchFrequency] = useState("15")
  const [searchQuery, setSearchQuery] = useState("")
  const [minDealSize, setMinDealSize] = useState("50000")
  const [targetRegion, setTargetRegion] = useState("global")
  const [activePlatform, setActivePlatform] = useState("all")
  const [activeCountry, setActiveCountry] = useState("all")
  const [activeTechnology, setActiveTechnology] = useState("all")
  const [activeIndustry, setActiveIndustry] = useState("all")
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, string>>(
    Object.fromEntries(SOURCE_KEYS.map((k) => [k, "idle"]))
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [savedConfig, setSavedConfig] = useState({ minDealSize: "50000", targetRegion: "global", searchFrequency: "15" })
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [sourceStats, setSourceStats] = useState<Record<string, { leadsFound: number; lastScan: string }>>({})
  const [hunterFetching, setHunterFetching] = useState(false)
  const [outreachRunning, setOutreachRunning] = useState(false)
  const [outreachProgress, setOutreachProgress] = useState(0)
  const [outreachLog, setOutreachLog] = useState<{ company: string; ok: boolean; error?: string }[]>([])
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [tasksCompleted, setTasksCompleted] = useState(0)

  useEffect(() => {
    const stored = getStoredDiscoveries()
    if (stored.length > 0) {
      setDiscoveries(stored)
    } else {
      const leads = getStoredLeads()
      if (leads.length > 0) {
        const mapped = leads.map(liveLeadToDiscovery)
        setDiscoveries(mapped)
        storeDiscoveries(mapped)
      }
    }
    const stats = getStoredSourceStats()
    if (Object.keys(stats).length > 0) setSourceStats(stats)
    setTasksCompleted(getStoredOutreach().length)
  }, [])

  const searchSources = useMemo<Source[]>(() =>
    SOURCE_KEYS.map((key) => {
      const meta = LIVE_SOURCE_MAP[key]
      const stats = sourceStats[key]
      return {
        ...meta,
        status: sourceStatuses[key] || "idle",
        leadsFound: stats?.leadsFound ?? 0,
        lastScan: formatScanTime(stats?.lastScan),
      }
    }), [sourceStatuses, sourceStats])

  const hunterAgent = useMemo(() => ({
    name: "Opportunity Hunter AI",
    currentTask: hunterFetching
      ? "Scanning live job boards..."
      : outreachRunning
        ? "Generating proposals & sending emails..."
        : "",
    tasksCompleted,
    efficiency: searchSources.length > 0
      ? Math.round((searchSources.reduce((a, s) => a + s.metrics.accuracy, 0) / searchSources.length))
      : 0,
  }), [hunterFetching, outreachRunning, tasksCompleted, searchSources])

  const filteredDiscoveries = useMemo(() => {
    return discoveries.filter((d) => {
      if (selectedFilter !== "all" && d.status !== selectedFilter) return false
      if (activePlatform !== "all") {
        const platformMap: Record<string, string[]> = {
          linkedin: ["linkedin"], twitter: ["twitter"], web: ["web crawling", "web scraping", "web"],
          crunchbase: ["crunchbase"], github: ["github"], email: ["email"],
        }
        const matches = platformMap[activePlatform] || []
        if (matches.length > 0 && !matches.some((m) => d.source.toLowerCase().includes(m))) return false
      }
      if (activeCountry !== "all") {
        const countryMap: Record<string, string[]> = {
          us: ["San Francisco", "New York", "Austin", "Chicago"], uk: ["London"], ca: ["Toronto"],
          de: ["berlin", "munich", "frankfurt"], au: ["sydney", "melbourne"],
        }
        const locations = countryMap[activeCountry] || []
        if (!locations.some((l) => d.location.toLowerCase().includes(l.toLowerCase()))) return false
      }
      if (activeTechnology !== "all") {
        const techTags: Record<string, string[]> = {
          react: ["saas", "ecommerce", "migration"], node: ["startup", "growth-stage"],
          python: ["ai-project", "data"], aws: ["cloud", "enterprise"], ai: ["ai-project", "technical-buyer"],
        }
        const matches = techTags[activeTechnology] || []
        if (!d.tags.some((t) => matches.some((m) => t.includes(m))) && !d.industry.toLowerCase().includes(activeTechnology)) return false
      }
      if (activeIndustry !== "all" && d.industry !== activeIndustry) return false
      if (parseInt(savedConfig.minDealSize) > 0 && d.dealSize < parseInt(savedConfig.minDealSize)) return false
      if (savedConfig.targetRegion !== "global") {
        const regionMap: Record<string, string[]> = {
          na: ["San Francisco", "New York", "Austin", "Chicago", "Toronto"],
          eu: ["London", "Berlin", "Munich", "Frankfurt"], apac: ["Sydney", "Melbourne"],
        }
        const regionLocations = regionMap[savedConfig.targetRegion] || []
        if (regionLocations.length > 0 && !regionLocations.some((l) => d.location.toLowerCase().includes(l.toLowerCase()))) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return d.title.toLowerCase().includes(q) || d.company.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) || d.industry.toLowerCase().includes(q) ||
          d.tags.some((t) => t.includes(q))
      }
      return true
    })
  }, [discoveries, selectedFilter, activePlatform, activeCountry, activeTechnology, activeIndustry, searchQuery, savedConfig])

  const toggleCategory = (id: string) =>
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, selected: !cat.selected } : cat))

  const toggleBookmark = (id: string) =>
    setBookmarkedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const toggleSourceStatus = (id: string) =>
    setSourceStatuses((prev) => ({ ...prev, [id]: prev[id] === "active" ? "idle" : "active" }))

  const handleStartHunter = useCallback(async () => {
    if (hunterFetching) return
    setHunterFetching(true)
    setIsRunning(true)
    setScanResult(null)
    setSourceStatuses(Object.fromEntries(SOURCE_KEYS.map((k) => [k, "scanning"])))
    try {
      const { leads, results } = await fetchAllSources(15)
      const existingIds = new Set(discoveries.map((d) => d.id))
      const fresh = leads
        .filter((l) => !existingIds.has(l.id))
        .map(liveLeadToDiscovery)
      const nextDiscoveries = fresh.length > 0 ? [...fresh, ...discoveries] : discoveries
      setDiscoveries(nextDiscoveries)
      storeDiscoveries(nextDiscoveries)

      // Generate notifications for newly discovered opportunities
      try {
        for (const d of fresh) {
          const isHigh = (d.dealSize || 0) >= 50000
          addNotification({
            id: `disc-${d.id}-${Date.now()}`,
            type: isHigh ? "high_value" : "new_lead",
            title: isHigh ? "High-value opportunity found" : "New opportunity found",
            message: `${d.company} — ${d.title} (${d.source})`,
            priority: isHigh ? "high" : "medium",
            read: false,
            createdAt: new Date().toISOString(),
            leadId: d.id,
          })
        }
        if (fresh.length > 0) {
          addNotification({
            id: `scan-${Date.now()}`,
            type: "system",
            title: "Hunter scan complete",
            message: `${fresh.length} new opportunities discovered across ${SOURCE_KEYS.length} sources`,
            priority: "low",
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
      } catch {}

      const now = new Date().toISOString()
      const nextStats = { ...sourceStats }
      let totalFetched = 0
      let errorCount = 0
      for (const key of SOURCE_KEYS) {
        const r = results[key]
        if (!r) continue
        totalFetched += r.fetched
        if (r.error) errorCount++
        nextStats[key] = {
          leadsFound: (nextStats[key]?.leadsFound || 0) + r.fetched,
          lastScan: now,
        }
      }
      setSourceStats(nextStats)
      storeSourceStats(nextStats)
      setSourceStatuses(Object.fromEntries(
        SOURCE_KEYS.map((k) => [k, results[k]?.error ? "error" : "active"])
      ))
      setTasksCompleted((t) => t + 1)
      const msg = errorCount > 0
        ? `Scan complete: ${totalFetched} leads fetched (${fresh.length} new), ${errorCount} source(s) unavailable`
        : `Scan complete: ${totalFetched} leads fetched across ${SOURCE_KEYS.length} sources (${fresh.length} new)`
      setScanResult(msg)
      setToastMessage(`Hunter found ${fresh.length} new opportunities`)
    } catch (e: any) {
      setSourceStatuses(Object.fromEntries(SOURCE_KEYS.map((k) => [k, "error"])))
      setScanResult(`Failed: ${e?.message || "Could not reach live sources"}`)
    } finally {
      setHunterFetching(false)
    }
  }, [hunterFetching, discoveries, sourceStats])

  const handleAutoOutreach = useCallback(async () => {
    if (outreachRunning) return
    const targets = [...discoveries].sort((a, b) => b.score - a.score).slice(0, 3)
    if (targets.length === 0) {
      setToastMessage("No discoveries yet — run the Hunter first")
      return
    }
    setOutreachRunning(true)
    setOutreachProgress(0)
    setOutreachLog([])
    const records = getStoredOutreach()
    const updated = [...discoveries]
    let successCount = 0
    let emailsSent = 0

    for (let i = 0; i < targets.length; i++) {
      const d = targets[i]
      try {
        const result = await api.proposals.generate({
          leadId: d.id,
          leadData: {
            title: d.title,
            description: d.description,
            budget: { min: d.dealSize * 0.3, max: d.dealSize },
            clientName: d.company,
            company: d.company,
            technologies: d.tags,
            country: d.location,
            competition: 0,
          },
          tone: "professional",
          instructions: `Generate a tailored business proposal for ${d.company} regarding the "${d.title}" opportunity discovered on ${d.source} (${d.location}). Key technologies: ${d.tags.join(", ") || "N/A"}.`,
        }) as any

        const coverLetter = result?.coverLetter || result?.sections?.coverLetter || result?.cover_letter || ""
        const introduction = result?.introduction || result?.sections?.introduction || ""
        const technicalPlan = result?.technicalPlan || result?.sections?.technicalPlan || result?.technical_plan || ""
        const costEstimate = result?.costEstimate || result?.sections?.costEstimate || result?.cost_estimate || ""
        const callToAction = result?.callToAction || result?.sections?.callToAction || result?.call_to_action || ""
        const proposalTitle = result?.title || `Proposal: ${d.title} at ${d.company}`

        const proposalRecord = {
          id: result?.id || `prop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: proposalTitle,
          clientName: d.company,
          company: d.company,
          status: "draft",
          winProbability: result?.winProbability || 72,
          budget: d.dealSize,
          createdAt: new Date().toISOString(),
          sections: { coverLetter, introduction, technicalPlan, costEstimate, callToAction },
          portfolioSuggestions: result?.portfolioSuggestions || [],
        }

        const stored = JSON.parse(localStorage.getItem("mbpw_proposals") || "[]")
        stored.unshift(proposalRecord)
        localStorage.setItem("mbpw_proposals", JSON.stringify(stored))

        const recipientEmail = d.contactEmail || d.contact || `contact@${d.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
        const emailSubject = `Business Proposal: ${d.title}`
        const emailBody = `${introduction || coverLetter || `Dear ${d.company} team,\n\nWe are pleased to present our proposal for the ${d.title} opportunity.\n\n${technicalPlan}\n\n${costEstimate ? `Investment: ${costEstimate}\n\n` : ""}${callToAction || "We look forward to discussing this opportunity with you."}`}\n\nBest regards,\nMMA Business Prosperity Weapon\nMuhammad Muneeb Akram\nMuhammadmuneebakram819@gmail.com`

        let emailMethod = "none"
        try {
          const emailResult = await api.proposals.sendDirect({
            recipient_email: recipientEmail,
            subject: emailSubject,
            body_text: emailBody,
          }) as any
          if (emailResult?.success) {
            emailMethod = "smtp"
            emailsSent++
          } else {
            emailMethod = "mailto"
            window.open(
              `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
              "_blank"
            )
          }
        } catch {
          emailMethod = "mailto"
          window.open(
            `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
            "_blank"
          )
        }

        records.unshift({
          id: `outreach-${d.id}-${Date.now()}`,
          discoveryId: d.id,
          company: d.company,
          title: d.title,
          proposal: proposalRecord,
          generatedAt: new Date().toISOString(),
          status: emailMethod === "smtp" ? "sent" : "emailed",
          emailMethod,
          recipientEmail,
        })
        storeOutreach(records)
        successCount++
        setOutreachLog((prev) => [...prev, { company: d.company, ok: true, error: emailMethod === "smtp" ? "Email sent via SMTP" : "Email opened in mail client" }])
        const idx = updated.findIndex((x) => x.id === d.id)
        if (idx >= 0) updated[idx] = { ...updated[idx], status: "proposal-sent" }
      } catch (e: any) {
        setOutreachLog((prev) => [...prev, { company: d.company, ok: false, error: e?.message || "Failed" }])
      }
      setOutreachProgress(Math.round(((i + 1) / targets.length) * 100))
    }

    setDiscoveries(updated)
    storeDiscoveries(updated)
    setTasksCompleted((t) => t + successCount)
    setOutreachRunning(false)
    setToastMessage(`Outreach complete: ${successCount} proposals generated, ${emailsSent} emails sent via SMTP`)
  }, [outreachRunning, discoveries])

  const handleExport = () => {
    const data = filteredDiscoveries.map((d) => ({
      title: d.title, company: d.company, dealSize: d.dealSize,
      score: d.score, status: d.status, source: d.source, location: d.location,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "discoveries-export.json"; a.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setSearchQuery(""); setSelectedFilter("all")
    setActivePlatform("all"); setActiveCountry("all"); setActiveTechnology("all"); setActiveIndustry("all")
  }

  const handleConfigSave = (toastMsg?: string) => {
    setSavedConfig({ minDealSize, targetRegion, searchFrequency })
    setToastMessage(toastMsg || "Configuration saved")
    setShowConfigDialog(false)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
                        <Breadcrumbs />
            <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 flex-wrap">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Global Opportunity Hunter
                    </span>
                    <Badge variant="secondary" className={cn("text-xs font-medium shrink-0",
                      isRunning ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20")}>
                      {isRunning ? "ACTIVE" : "PAUSED"}
                    </Badge>
                  </h1>
                  <p className="text-zinc-400 mt-1">AI-powered lead discovery across global platforms</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50"
                    onClick={() => setShowConfigDialog(true)}>
                    <Settings className="w-4 h-4 mr-2" />Configure
                  </Button>
                  <Button variant="outline" size="sm"
                    onClick={handleAutoOutreach}
                    disabled={outreachRunning || hunterFetching || discoveries.length === 0}
                    className="border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200">
                    {outreachRunning
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Outreach {outreachProgress}%</>
                      : <><Sparkles className="w-4 h-4 mr-2" />Auto Outreach</>}
                  </Button>
                  <Button variant={isRunning ? "destructive" : "default"} size="sm"
                    onClick={() => {
                      if (!isRunning) {
                        handleStartHunter()
                      } else {
                        setIsRunning(false)
                        setSourceStatuses(Object.fromEntries(SOURCE_KEYS.map((k) => [k, "idle"])))
                      }
                    }}
                    disabled={hunterFetching}
                    className={cn(isRunning
                      ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      : "bg-gradient-to-r from-emerald-600 to-rose-600 hover:from-emerald-500 hover:to-rose-500 text-white shadow-lg shadow-emerald-500/20")}>
                    {hunterFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</>
                      : isRunning ? <><Pause className="w-4 h-4 mr-2" />Pause Hunter</>
                        : <><Play className="w-4 h-4 mr-2" />Start Hunter</>}
                  </Button>
                </div>
              </div>
              {outreachRunning && (
                <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-5 py-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center gap-2 text-violet-300">
                      <Send className="w-4 h-4" />Generating proposals & sending emails...
                    </span>
                    <span className="text-violet-400 font-medium">{outreachProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${outreachProgress}%` }} />
                  </div>
                  {outreachLog.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {outreachLog.map((entry, i) => (
                        <p key={i} className={cn("text-xs", entry.ok ? "text-emerald-400" : "text-red-400")}>
                          {entry.ok ? "✓" : "✗"} {entry.company}{entry.error ? ` — ${entry.error}` : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <HunterStats isRunning={isRunning} hunterAgent={hunterAgent} searchSources={searchSources}
              sourceStatuses={sourceStatuses} newDiscoveryCount={discoveries.filter((d) => d.status === "new").length} />

            {scanResult && (
              <div className={cn("rounded-xl px-5 py-3 text-sm border",
                scanResult.includes("Error") || scanResult.includes("Failed")
                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300")}>
                {scanResult}
              </div>
            )}

            <Tabs defaultValue="sources" className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <TabsList className="bg-zinc-900/50 border border-zinc-800/50 p-1 h-12">
                <TabsTrigger value="sources" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4">
                  <Globe className="w-4 h-4" />Search Sources
                </TabsTrigger>
                <TabsTrigger value="discoveries" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4">
                  <Sparkles className="w-4 h-4" />Discoveries
                </TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4">
                  <Settings className="w-4 h-4" />Configuration
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="mt-6 space-y-6">
                <SourceCards sources={searchSources} sourceStatuses={sourceStatuses}
                  onToggleStatus={toggleSourceStatus} onSelectSource={setSelectedSource} />
              </TabsContent>

              <TabsContent value="discoveries" className="mt-6 space-y-6">
                <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery}
                  selectedFilter={selectedFilter} onFilterChange={setSelectedFilter}
                  activePlatform={activePlatform} onPlatformChange={setActivePlatform}
                  activeCountry={activeCountry} onCountryChange={setActiveCountry}
                  activeTechnology={activeTechnology} onTechnologyChange={setActiveTechnology}
                  activeIndustry={activeIndustry} onIndustryChange={setActiveIndustry}
                  onExport={handleExport} onResetFilters={resetFilters} />
                <DiscoveryFeed discoveries={filteredDiscoveries} bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark} onSelectDiscovery={setSelectedDiscovery} />
              </TabsContent>

              <TabsContent value="config" className="mt-6 space-y-6">
                <ConfigPanel categories={categories} onToggleCategory={toggleCategory}
                  searchFrequency={searchFrequency} onSearchFrequencyChange={setSearchFrequency}
                  minDealSize={minDealSize} onMinDealSizeChange={setMinDealSize}
                  targetRegion={targetRegion} onTargetRegionChange={setTargetRegion}
                  onSave={() => handleConfigSave("Configuration saved")} />
              </TabsContent>
            </Tabs>
          </div>
                  <Footer />
          </main>
      </div>

      <DetailDialogs
        selectedSource={selectedSource} onCloseSource={() => setSelectedSource(null)}
        sourceStatuses={sourceStatuses} onToggleSourceStatus={toggleSourceStatus}
        selectedDiscovery={selectedDiscovery} onCloseDiscovery={() => setSelectedDiscovery(null)}
        bookmarkedIds={bookmarkedIds} onToggleBookmark={toggleBookmark}
        showConfigDialog={showConfigDialog} onCloseConfigDialog={() => setShowConfigDialog(false)}
        searchFrequency={searchFrequency} onSearchFrequencyChange={setSearchFrequency}
        minDealSize={minDealSize} onMinDealSizeChange={setMinDealSize}
        targetRegion={targetRegion} onTargetRegionChange={setTargetRegion}
        onConfigSave={() => handleConfigSave("Settings applied")} />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
