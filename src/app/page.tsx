"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  formatCurrency, 
  formatNumber, 
  timeAgo, 
  cn 
} from "@/lib/utils"
import {
  mockAgents,
  mockLeads,
  mockProposals,
  mockNotifications,
  mockActivityLog,
  mockAnalytics,
} from "@/lib/mock-data"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  Zap,
  Brain,
  Search,
  Bell,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bot,
  Globe,
  Mail,
  BarChart3,
  PieChart,
  RefreshCw,
  ChevronRight,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Cpu,
  Wifi,
  WifiOff,
  Settings,
  Play,
  Pause,
  MoreVertical,
  Filter,
  Download,
  Calendar,
  FileText,
  Send,
  MessageSquare,
  Video,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Share2,
  Bookmark,
  ExternalLink,
  X,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

function PulseDot({ status, className = "" }: { status: string; className?: string }) {
  const colors = {
    active: "bg-emerald-500",
    idle: "bg-amber-500",
    offline: "bg-zinc-500",
    error: "bg-red-500",
    searching: "bg-cyan-500",
    scanning: "bg-cyan-500",
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

function NotificationIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    high_value: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    urgent: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    government: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    enterprise: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    follow_up: <Info className="w-4 h-4 text-cyan-400" />,
    system: <Info className="w-4 h-4 text-cyan-400" />,
    agent: <Bot className="w-4 h-4 text-violet-400" />,
  }
  return <>{iconMap[type] || iconMap.system}</>
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

export default function DashboardPage() {
  const [activeAgentTab, setActiveAgentTab] = useState<"all" | "active" | "idle">("all")
  const [agentViewExpanded, setAgentViewExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<"probability" | "revenue" | "date">("probability")
  const [filterSource, setFilterSource] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showInsightsModal, setShowInsightsModal] = useState(false)
  const [showRevenueDetails, setShowRevenueDetails] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshingActivity, setIsRefreshingActivity] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
  }, [])

  const filteredAgents = mockAgents.filter((agent) => {
    if (activeAgentTab === "active") {
      return agent.status === "scanning" || agent.status === "analyzing" || agent.status === "generating"
    }
    if (activeAgentTab === "idle") {
      return agent.status === "idle" || agent.status === "paused"
    }
    return true
  })

  const sortedLeads = [...mockLeads]
    .sort((a, b) => {
      if (sortBy === "probability") return b.successProbability - a.successProbability
      if (sortBy === "revenue") return b.expectedRevenue - a.expectedRevenue
      return new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
    })
    .filter((lead) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          lead.clientName.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.title.toLowerCase().includes(q)
        )
      }
      return true
    })
    .slice(0, 5)

  const filteredNotifications = mockNotifications.filter((n) => {
    if (selectedNotificationId) return n.id === selectedNotificationId
    return true
  })

  const stats = [
    {
      title: "Total Revenue",
      value: mockAnalytics.totalRevenue,
      format: "currency",
      change: 12.5,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      title: "Active Leads",
      value: mockLeads.length,
      format: "number",
      change: 8.2,
      icon: Users,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
    },
    {
      title: "Conversion Rate",
      value: mockAnalytics.conversionRate,
      format: "percent",
      change: -2.1,
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      glow: "shadow-violet-500/20",
    },
    {
      title: "AI Efficiency",
      value: 94.7,
      format: "percent",
      change: 5.3,
      icon: Brain,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
    },
  ]

  const formatStatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return formatCurrency(value)
      case "percent":
        return `${value}%`
      default:
        return formatNumber(value)
    }
  }

  const revenueData = [
    { label: "Q1 2026", value: 425000, max: 500000 },
    { label: "Q2 2026", value: 387500, max: 500000 },
    { label: "Q3 2026", value: 312000, max: 500000 },
    { label: "Q4 2026", value: 275000, max: 500000 },
  ]

  const handleRefreshActivity = () => {
    setIsRefreshingActivity(true)
    setTimeout(() => {
      setIsRefreshingActivity(false)
      showToast("Activity feed refreshed")
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight truncate">
                    Executive Dashboard
                  </h1>
                  <p className="text-zinc-400 mt-1">
                    Welcome back. Here&apos;s your business at a glance.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-800 hover:bg-zinc-800/50"
                    onClick={() => showToast("Dashboard exported as PDF")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    onClick={() => setShowInsightsModal(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Insights
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={stat.title}
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 min-w-0 flex-1">
                        <p className="text-sm text-zinc-400 font-medium truncate">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight whitespace-nowrap">
                          {formatStatValue(stat.value, stat.format)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {stat.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              stat.change >= 0 ? "text-emerald-400" : "text-red-400"
                            )}
                          >
                            {stat.change >= 0 ? "+" : ""}
                            {stat.change}%
                          </span>
                          <span className="text-xs text-zinc-500">vs last month</span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "p-3 rounded-xl bg-gradient-to-br shadow-lg shrink-0",
                          stat.gradient,
                          stat.glow
                        )}
                      >
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - AI Agents & Activity */}
              <div className="xl:col-span-2 space-y-6 min-w-0">
                {/* AI Agent Status */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: "500ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">
                            AI Agent Fleet
                          </CardTitle>
                          <CardDescription>
                            {mockAgents.filter((a) => a.status === "scanning" || a.status === "analyzing" || a.status === "generating").length} of{" "}
                            {mockAgents.length} agents active
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant={activeAgentTab === "all" ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "text-xs h-7 px-2",
                            activeAgentTab === "all" ? "bg-zinc-700 hover:bg-zinc-600" : "text-zinc-400 hover:text-white"
                          )}
                          onClick={() => { setActiveAgentTab("all"); setAgentViewExpanded(false) }}
                        >
                          All
                        </Button>
                        <Button
                          variant={activeAgentTab === "active" ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "text-xs h-7 px-2",
                            activeAgentTab === "active" ? "bg-emerald-600 hover:bg-emerald-500" : "text-zinc-400 hover:text-white"
                          )}
                          onClick={() => { setActiveAgentTab("active"); setAgentViewExpanded(false) }}
                        >
                          Active
                        </Button>
                        <Button
                          variant={activeAgentTab === "idle" ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "text-xs h-7 px-2",
                            activeAgentTab === "idle" ? "bg-amber-600 hover:bg-amber-500" : "text-zinc-400 hover:text-white"
                          )}
                          onClick={() => { setActiveAgentTab("idle"); setAgentViewExpanded(false) }}
                        >
                          Idle
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredAgents.slice(0, agentViewExpanded ? undefined : 4).map((agent) => (
                        <div
                          key={agent.id}
                          className={cn(
                            "p-4 rounded-xl border transition-all duration-300 overflow-hidden",
                            "bg-zinc-800/30 border-zinc-800/50 hover:border-zinc-700/50",
                            "hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-zinc-900/50",
                            "group cursor-pointer"
                          )}
                          onClick={() => showToast(`Viewing agent: ${agent.name}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <PulseDot status={agent.status} className="shrink-0" />
                              <span className="font-medium text-sm truncate">{agent.name}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs shrink-0 ml-2",
                                agent.status === "scanning" || agent.status === "analyzing" || agent.status === "generating"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : agent.status === "idle"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                              )}
                            >
                              {agent.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2">
                            {agent.currentTask || "No active task"}
                          </p>
                          {(agent.status === "scanning" || agent.status === "analyzing" || agent.status === "generating") && (
                            <div className="mt-2 text-xs text-cyan-400 font-medium flex items-center gap-1">
                              <span>Working</span>
                              <TypingDots />
                            </div>
                          )}
                          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {agent.tasksCompleted} tasks
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {agent.efficiency}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredAgents.length > 4 && !agentViewExpanded && (
                      <div className="mt-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-cyan-400 hover:text-cyan-300 text-xs"
                          onClick={() => setAgentViewExpanded(true)}
                        >
                          Show all {filteredAgents.length} agents <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                    {agentViewExpanded && filteredAgents.length > 4 && (
                      <div className="mt-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-white text-xs"
                          onClick={() => setAgentViewExpanded(false)}
                        >
                          Show less
                        </Button>
                      </div>
                    )}
                    {filteredAgents.length === 0 && (
                      <p className="text-center text-sm text-zinc-500 py-8">No agents match this filter.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Activity Monitor */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: "600ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 shrink-0">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">
                            Activity Monitor
                          </CardTitle>
                          <CardDescription>
                            Real-time system activity
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-zinc-400 hover:text-white shrink-0",
                          isRefreshingActivity && "animate-spin"
                        )}
                        onClick={handleRefreshActivity}
                        disabled={isRefreshingActivity}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-1">
                        {mockActivityLog.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                            onClick={() => showToast(`Activity: ${activity.details.slice(0, 60)}...`)}
                          >
                            <div className="mt-0.5 shrink-0">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
                                {activity.action.includes("lead") && <Users className="w-3.5 h-3.5 text-cyan-400" />}
                                {activity.action.includes("proposal") && <FileText className="w-3.5 h-3.5 text-violet-400" />}
                                {activity.action.includes("system") && <Cpu className="w-3.5 h-3.5 text-amber-400" />}
                                {activity.action.includes("agent") && <Bot className="w-3.5 h-3.5 text-emerald-400" />}
                                {!activity.action.includes("lead") && !activity.action.includes("proposal") && !activity.action.includes("system") && !activity.action.includes("agent") && (
                                  <Activity className="w-3.5 h-3.5 text-zinc-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed line-clamp-2">
                                {activity.details}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {timeAgo(new Date(activity.timestamp))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: "700ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 shrink-0">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">
                            Revenue Overview
                          </CardTitle>
                          <CardDescription>
                            Quarterly performance breakdown
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white shrink-0"
                        onClick={() => setShowRevenueDetails(!showRevenueDetails)}
                      >
                        {showRevenueDetails ? "Hide" : "Details"} <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", showRevenueDetails && "rotate-90")} />
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
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
                          </div>
                          {showRevenueDetails && (
                            <div className="flex items-center justify-between text-xs text-zinc-500 pl-1">
                              <span>{Math.round((item.value / item.max) * 100)}% of target ({formatCurrency(item.max)})</span>
                              <span className={cn(index === 0 ? "text-emerald-400" : index === 1 ? "text-amber-400" : "text-zinc-400")}>
                                {index === 0 ? "On track" : index === 1 ? "Below target" : "Needs attention"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {showRevenueDetails && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Total Annual Revenue</span>
                        <span className="text-lg font-bold">{formatCurrency(revenueData.reduce((sum, d) => sum + d.value, 0))}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Leads, Sources, Notifications */}
              <div className="space-y-6 min-w-0">
                {/* Top Priority Leads */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: "550ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20 shrink-0">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">
                            Priority Leads
                          </CardTitle>
                          <CardDescription>
                            Top scoring opportunities
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20 shrink-0">
                        {mockLeads.filter((l) => l.successProbability >= 80).length} hot
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search leads..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-8 pl-8 pr-3 text-xs bg-zinc-800/50 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-xs h-7 px-2",
                            sortBy === "probability" ? "bg-zinc-700 text-white" : "text-zinc-400"
                          )}
                          onClick={() => setSortBy("probability")}
                          title="Sort by probability"
                        >
                          <Target className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-xs h-7 px-2",
                            sortBy === "revenue" ? "bg-zinc-700 text-white" : "text-zinc-400"
                          )}
                          onClick={() => setSortBy("revenue")}
                          title="Sort by revenue"
                        >
                          <DollarSign className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-xs h-7 px-2",
                            sortBy === "date" ? "bg-zinc-700 text-white" : "text-zinc-400"
                          )}
                          onClick={() => setSortBy("date")}
                          title="Sort by date"
                        >
                          <Clock className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="space-y-3">
                      {sortedLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className={cn(
                            "p-3 rounded-xl bg-zinc-800/30 border transition-all cursor-pointer group",
                            selectedLeadId === lead.id
                              ? "border-cyan-500/50 bg-zinc-800/50"
                              : "border-zinc-800/50 hover:border-zinc-700/50"
                          )}
                          onClick={() => {
                            setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id)
                            showToast(`Selected lead: ${lead.clientName}`)
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm group-hover:text-white transition-colors truncate">
                                {lead.clientName}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                {lead.company} &bull; {lead.title}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs shrink-0 ml-2",
                                lead.successProbability >= 90
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : lead.successProbability >= 70
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-zinc-500/10 text-zinc-400"
                              )}
                            >
                              {lead.successProbability}%
                            </Badge>
                          </div>
                          <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                                lead.successProbability >= 90
                                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                                  : lead.successProbability >= 70
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                                  : "bg-gradient-to-r from-zinc-500 to-zinc-400"
                              )}
                              style={{ width: `${lead.successProbability}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(lead.expectedRevenue)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(new Date(lead.foundAt))}
                            </span>
                          </div>
                        </div>
                      ))}
                      {sortedLeads.length === 0 && (
                        <p className="text-center text-sm text-zinc-500 py-4">No leads match your search.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Search Sources */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: "650ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 shrink-0">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">
                            Search Sources
                          </CardTitle>
                          <CardDescription>
                            Active monitoring channels
                          </CardDescription>
                        </div>
                      </div>
                      {filterSource && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-white shrink-0"
                          onClick={() => setFilterSource(null)}
                        >
                          <X className="w-3 h-3 mr-1" /> Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "LinkedIn", icon: ExternalLink, count: 45 },
                        { name: "Twitter", icon: ExternalLink, count: 23 },
                        { name: "Email", icon: Mail, count: 12 },
                        { name: "Web", icon: Globe, count: 67 },
                        { name: "Crunchbase", icon: Building2, count: 31 },
                        { name: "GitHub", icon: Code, count: 18 },
                      ].map((source) => (
                        <div
                          key={source.name}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-full border transition-all cursor-pointer group",
                            filterSource === source.name
                              ? "bg-cyan-500/10 border-cyan-500/30"
                              : "bg-zinc-800/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                          )}
                          onClick={() => {
                            setFilterSource(filterSource === source.name ? null : source.name)
                            showToast(`Filtering by: ${source.name}`)
                          }}
                        >
                          <PulseDot status="active" className="!h-2 !w-2" />
                          <source.icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                          <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                            {source.name}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {source.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: "750ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 shrink-0">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">
                            Notifications
                          </CardTitle>
                          <CardDescription>
                            Recent alerts and updates
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {selectedNotificationId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white text-xs"
                            onClick={() => setSelectedNotificationId(null)}
                          >
                            Show all
                          </Button>
                        )}
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                        >
                          {mockNotifications.filter((n) => !n.read).length} new
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-2">
                        {filteredNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-3 rounded-lg border transition-all cursor-pointer",
                              selectedNotificationId === notification.id
                                ? "bg-zinc-800/60 border-zinc-600/50"
                                : notification.read
                                ? "bg-zinc-800/20 border-zinc-800/30 hover:bg-zinc-800/30"
                                : "bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/50"
                            )}
                            onClick={() => {
                              setSelectedNotificationId(
                                selectedNotificationId === notification.id ? null : notification.id
                              )
                              if (!notification.read) {
                                showToast("Notification marked as read")
                              }
                            }}
                          >
                            <div className="flex items-start gap-2.5">
                              <NotificationIcon type={notification.type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm leading-relaxed line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {timeAgo(new Date(notification.createdAt))}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* AI Insights Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInsightsModal(false)}
          />
          <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-900/50 overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">AI Insights</h2>
                  <p className="text-xs text-zinc-400">Powered by MBPW Intelligence</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => setShowInsightsModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Revenue Opportunity</span>
                </div>
                <p className="text-sm text-zinc-300">3 government contracts worth $1.2M total show 89% success probability. Recommend immediate outreach.</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium">Risk Alert</span>
                </div>
                <p className="text-sm text-zinc-300">Enterprise lead &quot;TechCorp&quot; has decreased engagement score by 15%. Follow-up recommended within 24 hours.</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium">Agent Optimization</span>
                </div>
                <p className="text-sm text-zinc-300">Lead Scanning Agent efficiency improved 12% this week. Task queue processing at optimal levels.</p>
              </div>
            </div>
            <div className="p-5 border-t border-zinc-800/50 flex justify-end">
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                onClick={() => { setShowInsightsModal(false); showToast("Full report sent to your email") }}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Full Report
              </Button>
            </div>
          </div>
        </div>
      )}
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
