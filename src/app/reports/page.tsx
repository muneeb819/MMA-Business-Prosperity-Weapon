"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/glass-card"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Download, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface PipelineReport {
  total_leads: number
  total_proposals: number
  total_pipeline_value: number
  won_deals: number
  conversion_rate: number
  stages: Record<string, number>
  period_days: number
}

interface PerformanceReport {
  leads_by_day: { date: string; count: number }[]
  proposals_by_day: { date: string; count: number }[]
  total_agent_actions: number
  period_days: number
}

interface SummaryReport {
  total_leads: number
  new_leads_this_week: number
  new_leads_this_month: number
  total_proposals: number
  new_proposals_this_week: number
  active_companies: number
  report_date: string
}

const STAGE_COLORS: Record<string, string> = {
  new: "#3b82f6",
  analyzing: "#8b5cf6",
  qualified: "#ec4899",
  proposal_sent: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
}

export default function ReportsPage() {
  useEffect(() => { document.title = "Reports | MBPW"; }, [])
  const [period, setPeriod] = useState("30d")
  const [pipeline, setPipeline] = useState<PipelineReport | null>(null)
  const [performance, setPerformance] = useState<PerformanceReport | null>(null)
  const [summary, setSummary] = useState<SummaryReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [pipelineData, performanceData, summaryData] = await Promise.all([
        api.reports.pipeline(days).catch(() => null),
        api.reports.performance(days).catch(() => null),
        api.reports.summary().catch(() => null),
      ])
      if (pipelineData) setPipeline(pipelineData as PipelineReport)
      if (performanceData) setPerformance(performanceData as PerformanceReport)
      if (summaryData) setSummary(summaryData as SummaryReport)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }, [days])

  useEffect(() => { fetchData() }, [fetchData])

  const pipelineChartData = pipeline
    ? Object.entries(pipeline.stages).map(([name, value]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
        color: STAGE_COLORS[name] || "#6b7280",
      }))
    : []

  const leadTrendData = performance?.leads_by_day?.map((d) => {
    const date = new Date(d.date)
    const day = date.toLocaleDateString("en-US", { weekday: "short" })
    return { day, leads: d.count, qualified: Math.round(d.count * 0.6) }
  }) || []

  const proposalTrendData = performance?.proposals_by_day?.map((d) => {
    const date = new Date(d.date)
    const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return { date: day, proposals: d.count }
  }) || []

  const avgDealSize = summary && summary.total_leads > 0
    ? Math.round((pipeline?.total_pipeline_value || 0) / summary.total_leads)
    : 0

  const stats = [
    { label: "Pipeline Value", value: pipeline?.total_pipeline_value || 0, icon: DollarSign, color: "emerald", prefix: "$" },
    { label: "Conversion Rate", value: pipeline?.conversion_rate || 0, icon: Target, color: "blue", suffix: "%" },
    { label: "Avg. Deal Size", value: avgDealSize, icon: Activity, color: "purple", prefix: "$" },
    { label: "Win Rate", value: pipeline ? (pipeline.total_leads > 0 ? Math.round((pipeline.won_deals / pipeline.total_leads) * 1000) / 10 : 0) : 0, icon: TrendingUp, color: "emerald", suffix: "%" },
  ]

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <PageTransition>
            <div className="space-y-6">
              <Breadcrumbs />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-rose-400 bg-clip-text text-transparent">
                    Analytics & Reports
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">Pipeline performance & business intelligence</p>
                </div>
                <div className="flex items-center gap-2">
                  {["7d", "30d", "90d"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        period === p ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing} className="text-muted-foreground hover:text-foreground h-9 w-9 p-0">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-muted-foreground">Loading reports...</span>
                </div>
              ) : (
                <>
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                      <StaggerItem key={i}>
                        <GlassCard className="p-5" glow={stat.color as any}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                              <p className="text-2xl font-bold mt-2 text-foreground">
                                {stat.prefix || ""}<AnimatedCounter end={stat.value} decimals={stat.value % 1 !== 0 ? 1 : 0} />{stat.suffix || ""}
                              </p>
                              {summary && i === 0 && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {summary.total_leads} leads · {summary.total_proposals} proposals
                                </p>
                              )}
                            </div>
                            <div className="p-2 rounded-lg bg-muted/50">
                              <stat.icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </GlassCard>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {proposalTrendData.length > 0 && (
                      <GlassCard glow="blue">
                        <GlassCardHeader>
                          <h2 className="text-sm font-semibold text-foreground">Proposals Over Time</h2>
                        </GlassCardHeader>
                        <GlassCardContent className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={proposalTrendData}>
                              <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                              <Area type="monotone" dataKey="proposals" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </GlassCardContent>
                      </GlassCard>
                    )}

                    {pipelineChartData.length > 0 && (
                      <GlassCard glow="purple">
                        <GlassCardHeader>
                          <h2 className="text-sm font-semibold text-foreground">Pipeline Stages</h2>
                        </GlassCardHeader>
                        <GlassCardContent className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pipelineChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                {pipelineChartData.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {pipelineChartData.map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground">{item.name} ({item.value})</span>
                              </div>
                            ))}
                          </div>
                        </GlassCardContent>
                      </GlassCard>
                    )}
                  </div>

                  {leadTrendData.length > 0 && (
                    <GlassCard glow="emerald">
                      <GlassCardHeader>
                        <h2 className="text-sm font-semibold text-foreground">Lead Generation Trend</h2>
                      </GlassCardHeader>
                      <GlassCardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={leadTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                            <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="qualified" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </GlassCardContent>
                    </GlassCard>
                  )}

                  {summary && (
                    <GlassCard>
                      <GlassCardHeader>
                        <h2 className="text-sm font-semibold text-foreground">Business Summary</h2>
                      </GlassCardHeader>
                      <GlassCardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {[
                            { label: "Total Leads", value: summary.total_leads },
                            { label: "New This Week", value: summary.new_leads_this_week },
                            { label: "New This Month", value: summary.new_leads_this_month },
                            { label: "Total Proposals", value: summary.total_proposals },
                            { label: "Proposals This Week", value: summary.new_proposals_this_week },
                            { label: "Active Companies", value: summary.active_companies },
                          ].map((item, i) => (
                            <div key={i} className="text-center p-3 rounded-xl bg-muted/30">
                              <p className="text-xl font-bold text-foreground">{item.value}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  )}
                </>
              )}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
