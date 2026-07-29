"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import { Globe, Play, Pause, Settings, Sparkles, X, CheckCircle, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type { Agent, ActivityLog } from "@/lib/types"
import { HunterStats } from "@/components/opportunity-hunter/HunterStats"
import { SourceCards } from "@/components/opportunity-hunter/SourceCards"
import { FilterBar } from "@/components/opportunity-hunter/FilterBar"
import { DiscoveryFeed } from "@/components/opportunity-hunter/DiscoveryFeed"
import { ConfigPanel } from "@/components/opportunity-hunter/ConfigPanel"
import { DetailDialogs } from "@/components/opportunity-hunter/DetailDialogs"
import { searchSources, discoveries, initialCategories } from "@/components/opportunity-hunter/types"
import type { Source, Discovery } from "@/components/opportunity-hunter/types"

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
  useEffect(() => { document.title = "Opportunity Hunter | MBPW"; }, []);
  const [isRunning, setIsRunning] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [categories, setCategories] = useState(initialCategories)
  const [searchFrequency, setSearchFrequency] = useState("15")
  const [searchQuery, setSearchQuery] = useState("")
  const [minDealSize, setMinDealSize] = useState("50000")
  const [targetRegion, setTargetRegion] = useState("global")
  const [activePlatform, setActivePlatform] = useState("all")
  const [activeCountry, setActiveCountry] = useState("all")
  const [activeTechnology, setActiveTechnology] = useState("all")
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, string>>(
    Object.fromEntries(searchSources.map((s) => [s.id, s.status]))
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [savedConfig, setSavedConfig] = useState({ minDealSize: "50000", targetRegion: "global", searchFrequency: "15" })
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentActivities, setAgentActivities] = useState<ActivityLog[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [agentsData, activity] = await Promise.all([
          api.agents.list().catch(() => [] as any),
          api.agents.activity("agent-1").catch(() => ({ logs: [] })),
        ])
        if (cancelled) return
        if (Array.isArray(agentsData) && agentsData.length > 0) {
          const mapped = agentsData.map((a: any) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            status: a.status,
            lastActive: a.last_active || a.lastActive || new Date().toISOString(),
            tasksCompleted: a.tasks_completed ?? a.tasksCompleted ?? 0,
            currentTask: a.current_task || a.currentTask || "",
            uptime: a.uptime ?? 99.9,
            efficiency: a.efficiency ?? 95,
            description: a.description || "",
            icon: a.icon || "search",
          }))
          setAgents(mapped as Agent[])
        }
        if (activity) setAgentActivities(((activity as any).logs || []) as ActivityLog[])
      } catch { /* keep defaults */ }
      if (!cancelled) setLoadingAgents(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const allAgents = agents.length > 0 ? agents : []
  const hunterAgent = allAgents.find((a) => a.type === "opportunity_hunter") || {
    id: "agent-1", name: "Opportunity Hunter AI", type: "opportunity_hunter" as const,
    status: (isRunning ? "scanning" : "idle") as "scanning" | "idle",
    lastActive: new Date().toISOString(), currentTask: "Scanning LinkedIn for high-intent prospects...",
    tasksCompleted: 1247, uptime: 99.9, efficiency: 94.7, description: "AI-powered opportunity hunter", icon: "search",
  }

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
  }, [selectedFilter, activePlatform, activeCountry, activeTechnology, searchQuery, savedConfig])

  const toggleCategory = (id: string) =>
    setCategories((prev) => prev.map((cat) => cat.id === id ? { ...cat, selected: !cat.selected } : cat))

  const toggleBookmark = (id: string) =>
    setBookmarkedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const toggleSourceStatus = (id: string) =>
    setSourceStatuses((prev) => ({ ...prev, [id]: prev[id] === "active" ? "idle" : "active" }))

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
    setActivePlatform("all"); setActiveCountry("all"); setActiveTechnology("all")
  }

  const handleConfigSave = (toastMsg?: string) => {
    setSavedConfig({ minDealSize, targetRegion, searchFrequency })
    setToastMessage(toastMsg || "Configuration saved")
    setShowConfigDialog(false)
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
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
                  <Button variant={isRunning ? "destructive" : "default"} size="sm"
                    onClick={() => setIsRunning(!isRunning)}
                    className={cn(isRunning
                      ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20")}>
                    {isRunning ? <><Pause className="w-4 h-4 mr-2" />Pause Hunter</>
                      : <><Play className="w-4 h-4 mr-2" />Start Hunter</>}
                  </Button>
                </div>
              </div>
            </div>

            <HunterStats isRunning={isRunning} hunterAgent={hunterAgent} searchSources={searchSources}
              sourceStatuses={sourceStatuses} newDiscoveryCount={discoveries.filter((d) => d.status === "new").length} />

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
