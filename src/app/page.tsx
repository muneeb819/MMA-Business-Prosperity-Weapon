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
} from "lucide-react"
import { useState, useEffect } from "react"

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

export default function DashboardPage() {
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
                  <h1 className="text-3xl font-bold tracking-tight">
                    Executive Dashboard
                  </h1>
                  <p className="text-zinc-400 mt-1">
                    Welcome back. Here&apos;s your business at a glance.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Insights
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={stat.title}
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-400 font-medium">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight">
                          {formatStatValue(stat.value, stat.format)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {stat.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
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
                          "p-3 rounded-xl bg-gradient-to-br shadow-lg",
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
              <div className="xl:col-span-2 space-y-6">
                {/* AI Agent Status */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: "500ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            AI Agent Fleet
                          </CardTitle>
                          <CardDescription>
                            {mockAgents.filter((a) => a.status === "scanning" || a.status === "analyzing" || a.status === "generating").length} of{" "}
                            {mockAgents.length} agents active
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mockAgents.slice(0, 4).map((agent, index) => (
                        <div
                          key={agent.id}
                          className={cn(
                            "p-4 rounded-xl border transition-all duration-300",
                            "bg-zinc-800/30 border-zinc-800/50 hover:border-zinc-700/50",
                            "hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-zinc-900/50",
                            "group cursor-pointer"
                          )}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <PulseDot status={agent.status} />
                              <span className="font-medium text-sm">{agent.name}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
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
                  </CardContent>
                </Card>

                {/* Activity Monitor */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: "600ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
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
                        className="text-zinc-400 hover:text-white"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-1">
                        {mockActivityLog.map((activity, index) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors group"
                          >
                            <div className="mt-0.5">
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
                              <p className="text-sm leading-relaxed">
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
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: "700ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
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
                        className="text-zinc-400 hover:text-white"
                      >
                        Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.map((item, index) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">{item.label}</span>
                            <span className="font-medium">
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Leads, Sources, Notifications */}
              <div className="space-y-6">
                {/* Top Priority Leads */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: "550ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Priority Leads
                          </CardTitle>
                          <CardDescription>
                            Top scoring opportunities
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                        {mockLeads.filter((l) => l.successProbability >= 80).length} hot
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...mockLeads]
                        .sort((a, b) => b.successProbability - a.successProbability)
                        .slice(0, 5)
                        .map((lead, index) => (
                          <div
                            key={lead.id}
                            className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-sm group-hover:text-white transition-colors">
                                  {lead.clientName}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {lead.company} • {lead.title}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
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
                    </div>
                  </CardContent>
                </Card>

                {/* Active Search Sources */}
                <Card
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: "650ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Search Sources
                        </CardTitle>
                        <CardDescription>
                          Active monitoring channels
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                          className="flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer group"
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
                  className="card-hover glass border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl animate-fade-in-up"
                  style={{ animationDelay: "750ms" }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Notifications
                          </CardTitle>
                          <CardDescription>
                            Recent alerts and updates
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                      >
                        {mockNotifications.filter((n) => !n.read).length} new
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-2">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-3 rounded-lg border transition-all cursor-pointer",
                              notification.read
                                ? "bg-zinc-800/20 border-zinc-800/30"
                                : "bg-zinc-800/40 border-zinc-700/50"
                            )}
                          >
                            <div className="flex items-start gap-2.5">
                              <NotificationIcon type={notification.type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm leading-relaxed">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {timeAgo(new Date(notification.createdAt))}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
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
