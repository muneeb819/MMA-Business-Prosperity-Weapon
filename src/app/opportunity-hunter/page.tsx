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
} from "lucide-react"
import { useState } from "react"

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

export default function OpportunityHunterPage() {
  const [isRunning, setIsRunning] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [categories, setCategories] = useState(searchCategories)
  const [searchFrequency, setSearchFrequency] = useState("15")

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

  const filteredDiscoveries = discoveries.filter((d) => {
    if (selectedFilter === "all") return true
    return d.status === selectedFilter
  })

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      )
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Global Opportunity Hunter
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium",
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-800 hover:bg-zinc-800/50"
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
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-violet-500/5" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Agent Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{hunterAgent.name}</h3>
                        {isRunning && <TypingDots />}
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">
                        {isRunning
                          ? hunterAgent.currentTask
                          : "Hunter is paused. Click start to resume."}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
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
                  <div className="flex items-center gap-8 md:border-l md:border-zinc-800 md:pl-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400">
                        {searchSources.reduce((a, s) => a + s.leadsFound, 0)}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Total Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-400">
                        {searchSources.filter((s) => s.status === "active").length}
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
                  {searchSources.map((source, index) => (
                    <Card
                      key={source.id}
                      className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl group cursor-pointer overflow-hidden relative"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                          source.gradient
                        )}
                        style={{ opacity: 0 }}
                      />
                      <CardContent className="p-5 relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                                source.gradient
                              )}
                            >
                              <source.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold group-hover:text-white transition-colors">
                                {source.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <PulseDot
                                  status={source.status}
                                  className="!h-1.5 !w-1.5"
                                />
                                <span className="text-xs text-zinc-500 capitalize">
                                  {source.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-zinc-800/50 text-zinc-400"
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Discoveries Tab */}
              <TabsContent value="discoveries" className="mt-6 space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
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
                  {filteredDiscoveries.map((discovery, index) => (
                    <Card
                      key={discovery.id}
                      className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl group cursor-pointer"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold group-hover:text-white transition-colors">
                                    {discovery.title}
                                  </h3>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs capitalize",
                                      statusColors[discovery.status]
                                    )}
                                  >
                                    {discovery.status.replace("-", " ")}
                                  </Badge>
                                </div>
                                <p className="text-sm text-zinc-400 mt-0.5">
                                  {discovery.company} - {discovery.industry}
                                </p>
                              </div>
                              <div className="text-right">
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

                            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-3">
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

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                        <Select defaultValue="50000">
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
                        <Select defaultValue="global">
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
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

function Code(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
