"use client"

import React, { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, formatNumber, timeAgo, cn } from "@/lib/utils"
import { mockAgents, mockLeads, mockProposals, mockNotifications, mockActivityLog, mockAnalytics } from "@/lib/mock-data"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  FileText,
  Briefcase,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  Brain,
  Search,
  Activity,
  BarChart3,
  Users,
  Wifi,
  Shield,
  Star,
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Bell,
} from "lucide-react"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = [
    {
      title: "Total Jobs Found",
      value: formatNumber(mockAnalytics.totalLeads),
      change: "+23",
      changeType: "positive" as const,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Projects Found",
      value: formatNumber(218),
      change: "+12",
      changeType: "positive" as const,
      icon: Target,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Leads Found",
      value: formatNumber(129),
      change: "+8",
      changeType: "positive" as const,
      icon: Users,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Proposals Queue",
      value: formatNumber(mockProposals.length),
      change: "2 pending",
      changeType: "neutral" as const,
      icon: FileText,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Win Probability",
      value: `${mockAnalytics.winRate}%`,
      change: "+2.1%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Revenue Forecast",
      value: formatCurrency(mockAnalytics.totalRevenue),
      change: "+18.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scanning": return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "analyzing": return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "generating": return "bg-violet-500/10 text-violet-600 border-violet-500/20"
      case "idle": return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      case "error": return "bg-red-500/10 text-red-600 border-red-500/20"
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "destructive"
      case "high": return "warning"
      case "medium": return "info"
      case "low": return "secondary"
      default: return "secondary"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Executive Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time overview of your AI-powered business development system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-mono font-medium">{currentTime.toLocaleTimeString()}</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bgColor)}>
                      <stat.icon className={cn("h-5 w-5", `text-${stat.color.split('-')[1]}-500`)} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      stat.changeType === "positive" && "bg-emerald-500/10 text-emerald-600",
                      stat.changeType === "neutral" && "bg-muted text-muted-foreground"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Agent Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Agent Status
                  </CardTitle>
                  <CardDescription>Real-time monitoring of all active AI agents</CardDescription>
                </div>
                <Badge variant="success" className="gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All Operational
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
                      agent.status !== "idle" && agent.status !== "error"
                        ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                        : "bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{agent.icon}</div>
                        <div>
                          <h4 className="font-semibold text-sm">{agent.name}</h4>
                          <p className="text-xs text-muted-foreground">{agent.description.slice(0, 60)}...</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(agent.status))}>
                          {agent.status === "scanning" && <Wifi className="h-3 w-3 mr-1 animate-pulse" />}
                          {agent.status === "analyzing" && <Search className="h-3 w-3 mr-1 animate-pulse" />}
                          {agent.status === "generating" && <FileText className="h-3 w-3 mr-1 animate-pulse" />}
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      </div>

                      {agent.currentTask && (
                        <div className="bg-background/50 rounded-lg p-2">
                          <p className="text-[11px] text-muted-foreground truncate">{agent.currentTask}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Tasks Done</p>
                          <p className="text-sm font-semibold">{formatNumber(agent.tasksCompleted)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Efficiency</p>
                          <p className="text-sm font-semibold">{agent.efficiency}%</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Uptime</span>
                          <span className="text-[10px] font-medium">{agent.uptime}%</span>
                        </div>
                        <Progress value={agent.uptime} className="h-1.5" />
                      </div>

                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active: {timeAgo(new Date(agent.lastActive))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Section: Activity + Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  AI Activity Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[380px]">
                  <div className="space-y-3">
                    {mockActivityLog.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          log.status === "success" && "bg-emerald-500/10",
                          log.status === "error" && "bg-red-500/10",
                          log.status === "info" && "bg-blue-500/10"
                        )}>
                          {log.status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          {log.status === "error" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {log.status === "info" && <Zap className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{log.action}</p>
                            <Badge variant="outline" className="text-[9px]">
                              {mockAgents.find(a => a.id === log.agentId)?.name?.split(" ")[0]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {timeAgo(new Date(log.timestamp))}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Leads */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="h-5 w-5 text-primary" />
                    Top Priority Leads
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[380px]">
                  <div className="space-y-3">
                    {mockLeads.sort((a, b) => b.expectedRevenue - a.expectedRevenue).slice(0, 6).map((lead) => (
                      <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                              {lead.title}
                            </h4>
                            <Badge variant={getUrgencyColor(lead.urgency) as BadgeProps["variant"]} className="text-[9px] shrink-0">
                              {lead.urgency}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{lead.company} · {lead.country}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-semibold text-emerald-600">
                              {formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}
                            </span>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{lead.successProbability}% success</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            {lead.technologies.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {tech}
                              </Badge>
                            ))}
                            {lead.technologies.length > 3 && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                +{lead.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalytics.monthlyRevenue.map((month) => (
                    <div key={month.month} className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground w-8">{month.month}</span>
                      <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${(month.revenue / 70000) * 100}%` }}
                        >
                          <span className="text-[10px] font-medium text-white">
                            {formatCurrency(month.revenue)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{month.proposals} props</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <Badge variant="destructive" className="text-[10px]">
                    {mockNotifications.filter(n => !n.read).length} new
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  <div className="space-y-3">
                    {mockNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                          !notif.read ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full mt-1.5 shrink-0",
                            notif.priority === "high" && "bg-red-500",
                            notif.priority === "medium" && "bg-amber-500",
                            notif.priority === "low" && "bg-blue-500"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                              {timeAgo(new Date(notif.createdAt))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Search Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Active Search Sources
              </CardTitle>
              <CardDescription>Currently monitoring platforms for new opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "LinkedIn", "Indeed", "Glassdoor", "Upwork", "Freelancer",
                  "Fiverr", "PeoplePerHour", "Guru", "Toptal", "Wellfound",
                  "RemoteOK", "WeWorkRemotely", "Dice", "Monster", "FlexJobs",
                  "Google Search", "Reddit", "Stack Overflow", "GitHub", "X/Twitter"
                ].map((platform) => (
                  <div
                    key={platform}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {platform}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
