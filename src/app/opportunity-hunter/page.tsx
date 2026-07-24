"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { mockAgents } from "@/lib/mock-data"
import {
  Bot,
  Globe,
  Play,
  Pause,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  ExternalLink,
  Building2,
  Mail,
  Target,
  Sparkles,
  Star,
  Bookmark,
  ArrowUpRight,
  Eye,
  MapPin,
  Search,
  X,
  Download,
  RefreshCw,
  Save,
  Filter,
} from "lucide-react"
import { useState, useMemo, useEffect } from "react"

function Code(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function PulseDot({ status, className = "" }: { status: string; className?: string }) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-amber-500",
    offline: "bg-zinc-500",
    error: "bg-red-500",
    paused: "bg-zinc-500",
    scanning: "bg-cyan-500",
    analyzing: "bg-cyan-500",
    generating: "bg-cyan-500",
  } as const

  return (
    <span className={cn("relative flex h-2.5 w-2.5", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
          colors[status as keyof typeof colors] || colors.offline
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          colors[status as keyof typeof colors] || colors.offline
        )}
      />
    </span>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1">
      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
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

const searchSources = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: ExternalLink,
    status: "active",
    leadsFound: 45,
    lastScan: "2 min ago",
    description: "Professional network scraping and engagement tracking",
    gradient: "from-blue-500 to-blue-700",
    metrics: { accuracy: 94, speed: 88 },
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: ExternalLink,
    status: "active",
    leadsFound: 23,
    lastScan: "5 min ago",
    description: "Real-time social listening and sentiment analysis",
    gradient: "from-sky-500 to-cyan-600",
    metrics: { accuracy: 87, speed: 95 },
  },
  {
    id: "email",
    name: "Email Mining",
    icon: Mail,
    status: "active",
    leadsFound: 12,
    lastScan: "12 min ago",
    description: "Automated email pattern recognition and lead extraction",
    gradient: "from-emerald-500 to-teal-600",
    metrics: { accuracy: 91, speed: 72 },
  },
  {
    id: "web",
    name: "Web Crawling",
    icon: Globe,
    status: "active",
    leadsFound: 67,
    lastScan: "1 min ago",
    description: "Deep web scraping with intelligent content filtering",
    gradient: "from-violet-500 to-purple-600",
    metrics: { accuracy: 89, speed: 92 },
  },
  {
    id: "crunchbase",
    name: "Crunchbase",
    icon: Building2,
    status: "idle",
    leadsFound: 31,
    lastScan: "1 hour ago",
    description: "Startup and company data enrichment",
    gradient: "from-amber-500 to-orange-600",
    metrics: { accuracy: 96, speed: 65 },
  },
  {
    id: "github",
    name: "GitHub",
    icon: Code,
    status: "active",
    leadsFound: 18,
    lastScan: "8 min ago",
    description: "Open source contributor activity monitoring",
    gradient: "from-zinc-400 to-zinc-600",
    metrics: { accuracy: 82, speed: 90 },
  },
]

const discoveries = [
  {
    id: "disc-1",
    title: "Series A SaaS Startup",
    company: "CloudSync Technologies",
    location: "San Francisco, CA",
    industry: "SaaS / Cloud",
    dealSize: 125000,
    score: 94,
    source: "LinkedIn",
    discoveredAt: "2 hours ago",
    tags: ["hot-lead", "decision-maker", "budget-confirmed"],
    status: "new",
    contact: "john@cloudsync.io",
    website: "https://cloudsync.io",
    description: "Series A funded SaaS startup looking for cloud infrastructure optimization. Decision maker identified with confirmed budget.",
  },
  {
    id: "disc-2",
    title: "Enterprise Digital Transformation",
    company: "Meridian Healthcare",
    location: "New York, NY",
    industry: "Healthcare",
    dealSize: 450000,
    score: 88,
    source: "Web Crawling",
    discoveredAt: "5 hours ago",
    tags: ["enterprise", "long-cycle", "multi-stakeholder"],
    status: "contacted",
    contact: "cto@meridianhealth.com",
    website: "https://meridianhealth.com",
    description: "Large healthcare provider undergoing digital transformation. Multi-stakeholder procurement process with 6-8 month cycle.",
  },
  {
    id: "disc-3",
    title: "AI Implementation Project",
    company: "Vertex Robotics",
    location: "Austin, TX",
    industry: "Manufacturing",
    dealSize: 275000,
    score: 91,
    source: "Twitter/X",
    discoveredAt: "8 hours ago",
    tags: ["ai-project", "technical-buyer", "urgency-high"],
    status: "qualified",
    contact: "vp-eng@vertexrobotics.com",
    website: "https://vertexrobotics.com",
    description: "Manufacturing company seeking AI implementation for quality control. Technical buyer identified with high urgency timeline.",
  },
  {
    id: "disc-4",
    title: "Marketing Automation Overhaul",
    company: "Bloom Digital Agency",
    location: "London, UK",
    industry: "Marketing",
    dealSize: 85000,
    score: 76,
    source: "Email Mining",
    discoveredAt: "1 day ago",
    tags: ["mid-market", "quick-close", "budget-flexible"],
    status: "proposal-sent",
    contact: "hello@bloomdigital.co.uk",
    website: "https://bloomdigital.co.uk",
    description: "Digital agency looking to overhaul their marketing automation stack. Quick close potential with flexible budget.",
  },
  {
    id: "disc-5",
    title: "Data Infrastructure Upgrade",
    company: "Pinnacle Financial",
    location: "Chicago, IL",
    industry: "Finance",
    dealSize: 320000,
    score: 82,
    source: "Crunchbase",
    discoveredAt: "1 day ago",
    tags: ["compliance", "security-focus", "enterprise"],
    status: "negotiation",
    contact: "infra@pinnaclefin.com",
    website: "https://pinnaclefin.com",
    description: "Financial institution upgrading data infrastructure with strict compliance and security requirements.",
  },
  {
    id: "disc-6",
    title: "E-commerce Platform Migration",
    company: "Nova Retail Group",
    location: "Toronto, Canada",
    industry: "Retail",
    dealSize: 195000,
    score: 79,
    source: "LinkedIn",
    discoveredAt: "2 days ago",
    tags: ["migration", "ecommerce", "growth-stage"],
    status: "new",
    contact: "tech@novaretail.ca",
    website: "https://novaretail.ca",
    description: "Fast-growing retail company migrating to a new e-commerce platform. Growth-stage company with scaling needs.",
  },
]

const searchCategories = [
  { id: "saas", label: "SaaS Companies", selected: true },
  { id: "startups", label: "Startups (Seed-A)", selected: true },
  { id: "enterprise", label: "Enterprise", selected: false },
  { id: "ecommerce", label: "E-commerce", selected: true },
  { id: "healthcare", label: "Healthcare", selected: false },
  { id: "finance", label: "FinTech", selected: true },
  { id: "manufacturing", label: "Manufacturing", selected: false },
  { id: "education", label: "EdTech", selected: false },
  { id: "agency", label: "Agencies", selected: true },
  { id: "remote", label: "Remote-first", selected: false },
]

const statusColors: Record<string, string> = {
  "new": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "contacted": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "qualified": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "proposal-sent": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "negotiation": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

const platformFilters = [
  { id: "all", label: "All Platforms" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter/X" },
  { id: "web", label: "Web" },
  { id: "email", label: "Email" },
  { id: "crunchbase", label: "Crunchbase" },
  { id: "github", label: "GitHub" },
]

const countryFilters = [
  { id: "all", label: "All Countries" },
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "de", label: "Germany" },
  { id: "au", label: "Australia" },
]

const technologyFilters = [
  { id: "all", label: "All Tech" },
  { id: "react", label: "React" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "aws", label: "AWS" },
  { id: "ai", label: "AI/ML" },
]

export default function OpportunityHunterPage() {
  const [isRunning, setIsRunning] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [categories, setCategories] = useState(searchCategories)
  const [searchFrequency, setSearchFrequency] = useState("15")
  const [searchQuery, setSearchQuery] = useState("")
  const [minDealSize, setMinDealSize] = useState("50000")
  const [targetRegion, setTargetRegion] = useState("global")
  const [activePlatform, setActivePlatform] = useState("all")
  const [activeCountry, setActiveCountry] = useState("all")
  const [activeTechnology, setActiveTechnology] = useState("all")
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [selectedSource, setSelectedSource] = useState<typeof searchSources[0] | null>(null)
  const [selectedDiscovery, setSelectedDiscovery] = useState<typeof discoveries[0] | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [sourceStatuses, setSourceStatuses] = useState<Record<string, string>>(
    Object.fromEntries(searchSources.map((s) => [s.id, s.status]))
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [savedConfig, setSavedConfig] = useState({ minDealSize: "50000", targetRegion: "global", searchFrequency: "15" })

  const hunterAgent = mockAgents.find((a) => a.type === "opportunity_hunter") || {
    id: "agent-1",
    name: "Opportunity Hunter AI",
    type: "opportunity_hunter" as const,
    status: (isRunning ? "scanning" : "idle") as "scanning" | "idle",
    lastActive: new Date().toISOString(),
    currentTask: "Scanning LinkedIn for high-intent prospects...",
    tasksCompleted: 1247,
    uptime: 99.9,
    efficiency: 94.7,
    description: "AI-powered opportunity hunter",
    icon: "search",
  }

  const filteredDiscoveries = useMemo(() => {
    return discoveries.filter((d) => {
      if (selectedFilter !== "all" && d.status !== selectedFilter) return false
      if (activePlatform !== "all") {
        const platformMap: Record<string, string[]> = {
          linkedin: ["linkedin"],
          twitter: ["twitter"],
          web: ["web crawling", "web scraping", "web"],
          crunchbase: ["crunchbase"],
          github: ["github"],
          email: ["email"],
        }
        const matches = platformMap[activePlatform] || []
        if (matches.length > 0 && !matches.some((m) => d.source.toLowerCase().includes(m))) return false
      }
      if (activeCountry !== "all") {
        const countryMap: Record<string, string[]> = {
          us: ["San Francisco", "New York", "Austin", "Chicago"],
          uk: ["London"],
          ca: ["Toronto"],
          de: ["berlin", "munich", "frankfurt"],
          au: ["sydney", "melbourne"],
        }
        const locations = countryMap[activeCountry] || []
        if (!locations.some((l) => d.location.toLowerCase().includes(l.toLowerCase()))) return false
      }
      if (activeTechnology !== "all") {
        const techTags: Record<string, string[]> = {
          react: ["saas", "ecommerce", "migration"],
          node: ["startup", "growth-stage"],
          python: ["ai-project", "data"],
          aws: ["cloud", "enterprise"],
          ai: ["ai-project", "technical-buyer"],
        }
        const matches = techTags[activeTechnology] || []
        if (!d.tags.some((t) => matches.some((m) => t.includes(m))) && !d.industry.toLowerCase().includes(activeTechnology)) return false
      }
      if (parseInt(savedConfig.minDealSize) > 0 && d.dealSize < parseInt(savedConfig.minDealSize)) return false
      if (savedConfig.targetRegion !== "global") {
        const regionMap: Record<string, string[]> = {
          na: ["San Francisco", "New York", "Austin", "Chicago", "Toronto"],
          eu: ["London", "Berlin", "Munich", "Frankfurt"],
          apac: ["Sydney", "Melbourne"],
        }
        const regionLocations = regionMap[savedConfig.targetRegion] || []
        if (regionLocations.length > 0 && !regionLocations.some((l) => d.location.toLowerCase().includes(l.toLowerCase()))) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          d.title.toLowerCase().includes(q) ||
          d.company.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.industry.toLowerCase().includes(q) ||
          d.tags.some((t) => t.includes(q))
        )
      }
      return true
    })
  }, [selectedFilter, activePlatform, activeCountry, activeTechnology, searchQuery, savedConfig])

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      )
    )
  }

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSourceStatus = (id: string) => {
    setSourceStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "active" ? "idle" : "active",
    }))
  }

  const handleExport = () => {
    const data = filteredDiscoveries.map((d) => ({
      title: d.title,
      company: d.company,
      dealSize: d.dealSize,
      score: d.score,
      status: d.status,
      source: d.source,
      location: d.location,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "discoveries-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 flex-wrap">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Global Opportunity Hunter
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium shrink-0",
                        isRunning
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      )}
                    >
                      {isRunning ? "ACTIVE" : "PAUSED"}
                    </Badge>
                  </h1>
                  <p className="text-zinc-400 mt-1">
                    AI-powered lead discovery across global platforms
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-800 hover:bg-zinc-800/50"
                    onClick={() => setShowConfigDialog(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button
                    variant={isRunning ? "destructive" : "default"}
                    size="sm"
                    onClick={() => setIsRunning(!isRunning)}
                    className={cn(
                      isRunning
                        ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                    )}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Hunter
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Hunter
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Agent Status Card - Full Width */}
            <Card
              className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden relative"
              style={{ animationDelay: "100ms" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-violet-500/5 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent pointer-events-none" />
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Agent Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <PulseDot
                          status={isRunning ? "scanning" : "idle"}
                          className="!h-4 !w-4"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold truncate">{hunterAgent.name}</h3>
                        {isRunning && <TypingDots />}
                      </div>
                      <p className="text-sm text-zinc-400 mt-1 truncate">
                        {isRunning
                          ? hunterAgent.currentTask
                          : "Hunter is paused. Click start to resume."}
                      </p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-medium">
                            {hunterAgent.tasksCompleted.toLocaleString()} tasks
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-medium">
                            {hunterAgent.efficiency}% efficiency
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-zinc-800">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-medium">
                            99.9% uptime
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 md:border-l md:border-zinc-800 md:pl-8 shrink-0">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400">
                        {searchSources.reduce((a, s) => a + s.leadsFound, 0)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Total Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-400">
                        {Object.values(sourceStatuses).filter((s) => s === "active").length}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Active Sources</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-violet-400">
                        {discoveries.filter((d) => d.status === "new").length}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">New Today</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Tabs
              defaultValue="sources"
              className="animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <TabsList className="bg-zinc-900/50 border border-zinc-800/50 p-1 h-12">
                <TabsTrigger
                  value="sources"
                  className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4"
                >
                  <Globe className="w-4 h-4" />
                  Search Sources
                </TabsTrigger>
                <TabsTrigger
                  value="discoveries"
                  className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Discoveries
                </TabsTrigger>
                <TabsTrigger
                  value="config"
                  className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white gap-2 px-4"
                >
                  <Settings className="w-4 h-4" />
                  Configuration
                </TabsTrigger>
              </TabsList>

              {/* Search Sources Tab */}
              <TabsContent value="sources" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchSources.map((source) => (
                    <Card
                      key={source.id}
                      className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl group overflow-hidden relative"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                          source.gradient
                        )}
                      />
                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0",
                                source.gradient
                              )}
                            >
                              <source.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold group-hover:text-white transition-colors truncate">
                                {source.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <PulseDot
                                  status={sourceStatuses[source.id] || source.status}
                                  className="!h-1.5 !w-1.5"
                                />
                                <span className="text-xs text-zinc-500 capitalize">
                                  {sourceStatuses[source.id] || source.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-zinc-800/50 text-zinc-400 shrink-0 ml-2"
                          >
                            {source.leadsFound} leads
                          </Badge>
                        </div>

                        <p className="text-xs text-zinc-500 mb-4 line-clamp-2">
                          {source.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Accuracy</span>
                            <span className="font-medium">{source.metrics.accuracy}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                              style={{ width: `${source.metrics.accuracy}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {source.lastScan}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                              onClick={() => toggleSourceStatus(source.id)}
                            >
                              {sourceStatuses[source.id] === "active" ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                              onClick={() => setSelectedSource(source)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Discoveries Tab */}
              <TabsContent value="discoveries" className="mt-6 space-y-6">
                {/* Search and Filter Bar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        placeholder="Search discoveries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-zinc-900/50 border-zinc-800/50 focus-visible:ring-cyan-500/20"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-800 hover:bg-zinc-800/50"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-800 hover:bg-zinc-800/50"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedFilter("all")
                        setActivePlatform("all")
                        setActiveCountry("all")
                        setActiveTechnology("all")
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>

                  {/* Platform Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 font-medium mr-1">Platform:</span>
                    {platformFilters.map((pf) => (
                      <button
                        key={pf.id}
                        onClick={() => setActivePlatform(pf.id)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border",
                          activePlatform === pf.id
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                        )}
                      >
                        {pf.label}
                      </button>
                    ))}
                  </div>

                  {/* Country and Technology Filters */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-medium">Country:</span>
                      <Select value={activeCountry} onValueChange={setActiveCountry}>
                        <SelectTrigger className="h-8 w-[160px] bg-zinc-900/50 border-zinc-800/50 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {countryFilters.map((cf) => (
                            <SelectItem key={cf.id} value={cf.id} className="text-xs">
                              {cf.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-medium">Technology:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {technologyFilters.map((tf) => (
                          <button
                            key={tf.id}
                            onClick={() => setActiveTechnology(tf.id)}
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border",
                              activeTechnology === tf.id
                                ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                                : "bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                            )}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-zinc-500" />
                  {["all", "new", "contacted", "qualified", "proposal-sent", "negotiation"].map(
                    (filter) => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFilter(filter)}
                        className={cn(
                          "capitalize h-8 text-xs",
                          selectedFilter === filter
                            ? "bg-zinc-800 text-white"
                            : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/50"
                        )}
                      >
                        {filter.replace("-", " ")}
                      </Button>
                    )
                  )}
                </div>

                {/* Discovery List */}
                <div className="space-y-3">
                  {filteredDiscoveries.length === 0 ? (
                    <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl">
                      <CardContent className="p-12 text-center">
                        <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400 font-medium">No discoveries match your filters</p>
                        <p className="text-zinc-600 text-sm mt-1">Try adjusting your search criteria</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredDiscoveries.map((discovery) => (
                      <Card
                        key={discovery.id}
                        className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl group"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold group-hover:text-white transition-colors truncate">
                                      {discovery.title}
                                    </h3>
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs capitalize shrink-0",
                                        statusColors[discovery.status]
                                      )}
                                    >
                                      {discovery.status.replace("-", " ")}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-zinc-400 mt-0.5 truncate">
                                    {discovery.company} - {discovery.industry}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(discovery.dealSize)}
                                  </p>
                                  <div className="flex items-center gap-1 justify-end mt-1">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-sm font-medium">
                                      {discovery.score}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-3 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {discovery.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {discovery.source}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {discovery.discoveredAt}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {discovery.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-zinc-400 hover:text-white"
                                onClick={() => setSelectedDiscovery(discovery)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-9 w-9 p-0",
                                  bookmarkedIds.has(discovery.id)
                                    ? "text-amber-400 hover:text-amber-300"
                                    : "text-zinc-400 hover:text-white"
                                )}
                                onClick={() => toggleBookmark(discovery.id)}
                                title={bookmarkedIds.has(discovery.id) ? "Remove Bookmark" : "Bookmark"}
                              >
                                <Bookmark className={cn("w-4 h-4", bookmarkedIds.has(discovery.id) && "fill-amber-400")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-zinc-400 hover:text-white"
                                onClick={() => window.open(discovery.website, "_blank")}
                                title="Open Website"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Search Categories */}
                  <Card
                    className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Search Categories
                          </CardTitle>
                          <CardDescription>
                            Select industries and segments to target
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => toggleCategory(category.id)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                              category.selected
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                                : "bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                            )}
                          >
                            {category.selected && (
                              <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />
                            )}
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search Settings */}
                  <Card
                    className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Search Settings
                          </CardTitle>
                          <CardDescription>
                            Configure search frequency and behavior
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">
                          Search Frequency
                        </label>
                        <Select
                          value={searchFrequency}
                          onValueChange={setSearchFrequency}
                        >
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-800">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="5">Every 5 minutes</SelectItem>
                            <SelectItem value="15">Every 15 minutes</SelectItem>
                            <SelectItem value="30">Every 30 minutes</SelectItem>
                            <SelectItem value="60">Every hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">
                          Minimum Deal Size
                        </label>
                        <Select value={minDealSize} onValueChange={setMinDealSize}>
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-800">
                            <SelectValue placeholder="Select minimum" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="10000">$10,000+</SelectItem>
                            <SelectItem value="50000">$50,000+</SelectItem>
                            <SelectItem value="100000">$100,000+</SelectItem>
                            <SelectItem value="250000">$250,000+</SelectItem>
                            <SelectItem value="500000">$500,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">
                          Target Regions
                        </label>
                        <Select value={targetRegion} onValueChange={setTargetRegion}>
                          <SelectTrigger className="bg-zinc-800/50 border-zinc-800">
                            <SelectValue placeholder="Select regions" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="na">North America</SelectItem>
                            <SelectItem value="eu">Europe</SelectItem>
                            <SelectItem value="apac">Asia Pacific</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-2">
                        <Button
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                          onClick={() => {
                            setSavedConfig({ minDealSize, targetRegion, searchFrequency })
                            setToastMessage("Configuration saved")
                          }}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Configuration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Source Detail Dialog */}
      <Dialog open={!!selectedSource} onOpenChange={(open) => !open && setSelectedSource(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 z-50 max-w-lg">
          {selectedSource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", selectedSource.gradient)}>
                    <selectedSource.icon className="w-5 h-5 text-white" />
                  </div>
                  {selectedSource.name}
                </DialogTitle>
                <DialogDescription>{selectedSource.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Leads Found</p>
                    <p className="text-xl font-bold text-cyan-400">{selectedSource.leadsFound}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Status</p>
                    <p className="text-xl font-bold text-emerald-400 capitalize">{sourceStatuses[selectedSource.id]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Accuracy</p>
                    <p className="text-xl font-bold text-violet-400">{selectedSource.metrics.accuracy}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Speed</p>
                    <p className="text-xl font-bold text-amber-400">{selectedSource.metrics.speed}%</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  Last scan: {selectedSource.lastScan}
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toggleSourceStatus(selectedSource.id)}
                >
                  {sourceStatuses[selectedSource.id] === "active" ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Source
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate Source
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Discovery Detail Dialog */}
      <Dialog open={!!selectedDiscovery} onOpenChange={(open) => !open && setSelectedDiscovery(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 z-50 max-w-lg">
          {selectedDiscovery && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedDiscovery.title}
                  <Badge
                    variant="secondary"
                    className={cn("text-xs capitalize", statusColors[selectedDiscovery.status])}
                  >
                    {selectedDiscovery.status.replace("-", " ")}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedDiscovery.company}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-zinc-400">{selectedDiscovery.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Deal Size</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(selectedDiscovery.dealSize)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Score</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <p className="text-xl font-bold text-amber-400">{selectedDiscovery.score}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedDiscovery.location}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{selectedDiscovery.source}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedDiscovery.contact}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedDiscovery.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                    onClick={() => {
                      window.open(selectedDiscovery.website, "_blank")
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Website
                  </Button>
                  <Button
                    variant="outline"
                    className="border-zinc-800 hover:bg-zinc-800/50"
                    onClick={() => toggleBookmark(selectedDiscovery.id)}
                  >
                    <Bookmark className={cn("w-4 h-4", bookmarkedIds.has(selectedDiscovery.id) && "fill-amber-400 text-amber-400")} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Config Dialog (from header Configure button) */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 z-50 max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Configuration</DialogTitle>
            <DialogDescription>
              Adjust core hunter settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Search Frequency</label>
              <Select value={searchFrequency} onValueChange={setSearchFrequency}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Minimum Deal Size</label>
              <Select value={minDealSize} onValueChange={setMinDealSize}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="10000">$10,000+</SelectItem>
                  <SelectItem value="50000">$50,000+</SelectItem>
                  <SelectItem value="100000">$100,000+</SelectItem>
                  <SelectItem value="250000">$250,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Target Region</label>
              <Select value={targetRegion} onValueChange={setTargetRegion}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="na">North America</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="apac">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
              onClick={() => {
                setSavedConfig({ minDealSize, targetRegion, searchFrequency })
                setToastMessage("Settings applied")
                setShowConfigDialog(false)
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}
