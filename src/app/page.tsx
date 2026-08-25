"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ErrorBoundary } from "@/components/error-boundary"
import { WidgetSkeleton } from "@/components/skeleton"
import { EmptyState } from "@/components/empty-state"
import { Tooltip } from "@/components/tooltip-wrapper"
import { ExportCSV } from "@/components/export-button"
import { Button } from "@/components/ui/button"
import { Download, Sparkles, X, TrendingUp, AlertTriangle, Brain, Send, CheckCircle, Loader2, RefreshCw, Clock, RotateCcw } from "lucide-react"
import { useState, useCallback, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { getStoredLeads } from "@/lib/live-sources"
import type { Lead, Notification, Agent, ActivityLog, AnalyticsData } from "@/lib/types"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { RevenueOverview } from "@/components/dashboard/RevenueOverview"
import { AgentFleet } from "@/components/dashboard/AgentFleet"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { LeadPipeline } from "@/components/dashboard/LeadPipeline"
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel"
import { ExecutiveBriefing } from "@/components/dashboard/ExecutiveBriefing"
import type { BriefingData } from "@/components/dashboard/ExecutiveBriefing"

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up" role="alert">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl shadow-zinc-900/50">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="text-sm text-zinc-100">{message}</p>
        <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white transition-colors" aria-label="Dismiss notification">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

const insightItems = [
  { icon: TrendingUp, iconClass: "text-emerald-400", title: "Getting Started", body: "Connect your lead sources on the Connectors page to start pulling real opportunities. Use the Sync All Sources button to fetch live data." },
]

export default function DashboardPage() {
  useEffect(() => { document.title = "Dashboard | MBPW"; }, []);
  const [activeAgentTab, setActiveAgentTab] = useState<"all" | "active" | "idle">("all")
  const [agentViewExpanded, setAgentViewExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<"probability" | "revenue" | "date">("probability")
  const [filterSource, setFilterSource] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showInsightsModal, setShowInsightsModal] = useState(false)
  const [showRevenueDetails, setShowRevenueDetails] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [aiInsights, setAiInsights] = useState<{ summary: string; top_recommendations: string[]; market_trends: string[]; risk_alerts: string[] } | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [briefingLoading, setBriefingLoading] = useState(true)

  const [leads, setLeads] = useState<Lead[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  const fetchAll = useCallback(async (showLoad = true) => {
    if (showLoad) setLoading(true)
    try {
      const [leadsData, notifsData, agentsData, analyticsData, briefingData] = await Promise.all([
        api.leads.list().catch(() => [] as any),
        api.notifications.list().catch(() => [] as any),
        api.agents.list().catch(() => [] as any),
        api.analytics.get().catch(() => null),
        api.ai.briefing().catch(() => null),
      ])
      if (Array.isArray(leadsData) && leadsData.length > 0) setLeads(leadsData as Lead[])
      else {
        const liveLeads = getStoredLeads().map((ll) => ({
          id: ll.id, title: ll.title, description: ll.description,
          clientName: ll.company, company: ll.company, email: "", phone: "",
          country: ll.country || "", budget: { min: ll.salaryMin || 0, max: ll.salaryMax || 0 },
          deadline: "", technologies: ll.technologies, skills: [], platform: ll.platform,
          jobType: "full_time", status: "new" as const, urgency: "medium" as const,
          difficulty: 50, successProbability: 60, riskLevel: "medium",
          expectedRevenue: (ll.salaryMax || 0) * 0.3, competition: 0,
          projectSize: "medium", paymentMethod: "Escrow",
          clientHistory: `Sourced from ${ll.source}`, url: ll.url,
          notes: `Live lead from ${ll.source}`, tags: ll.tags,
          foundAt: ll.publishedAt || new Date().toISOString(), analyzedAt: undefined,
        }));
        if (liveLeads.length > 0) setLeads(liveLeads as Lead[]);
      }
      if (briefingData) setBriefing(briefingData as BriefingData)
      setBriefingLoading(false)
      if (Array.isArray(notifsData) && notifsData.length > 0) setNotifications(notifsData as Notification[])
      if (Array.isArray(agentsData) && agentsData.length > 0) setAgents(agentsData as Agent[])
      if (analyticsData) setAnalytics(analyticsData as AnalyticsData)
      setLastUpdated(new Date())
    } catch { /* keep defaults */ }
    if (showLoad) setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => fetchAll(false), 30000)
    return () => clearInterval(interval)
  }, [fetchAll])

  useEffect(() => {
    if (showInsightsModal && !aiInsights) {
      setLoadingInsights(true);
      api.ai.insights()
        .then((data) => { setAiInsights(data as any); setLoadingInsights(false); })
        .catch(() => { setLoadingInsights(false); });
    }
  }, [showInsightsModal, aiInsights]);

  useEffect(() => {
    const handler = () => fetchAll(false)
    window.addEventListener("mbpw:export", handler)
    window.addEventListener("mbpw:ai-insights", () => setShowInsightsModal(true))
    return () => { window.removeEventListener("mbpw:export", handler); window.removeEventListener("mbpw:ai-insights", () => setShowInsightsModal(true)) }
  }, [fetchAll])

  const showToast = useCallback((msg: string) => setToastMessage(msg), [])

  const handleRefresh = useCallback(async (section: string) => {
    setRefreshing(section)
    await fetchAll(false)
    setTimeout(() => { setRefreshing(null); showToast(`${section} refreshed`) }, 500)
  }, [fetchAll, showToast])

  const handleNotificationExpand = useCallback((id: string) => {
    setExpandedNotificationId((prev) => (prev === id ? null : id))
  }, [])

  const activeAnalytics = analytics
  const currentLeads = leads.length > 0 ? leads : []
  const currentNotifications = notifications.length > 0 ? notifications : []
  const currentAgents = agents.length > 0 ? agents : []
  const currentActivities = activities.length > 0 ? activities : []

  const revenueMonths = activeAnalytics?.monthlyRevenue || []
  const maxMonthlyRevenue = revenueMonths.length > 0 ? Math.max(...revenueMonths.map((m: any) => m.revenue)) : 0
  const revenueData = revenueMonths.map((m: any) => ({ label: m.month, value: m.revenue, max: maxMonthlyRevenue }))

  const analyticsExportData = activeAnalytics ? [
    { metric: "Total Revenue", value: activeAnalytics.totalRevenue },
    { metric: "Total Leads", value: activeAnalytics.totalLeads },
    { metric: "Win Rate", value: `${activeAnalytics.winRate}%` },
    { metric: "Conversion Rate", value: `${activeAnalytics.conversionRate}%` },
    { metric: "Avg Deal Size", value: activeAnalytics.avgDealSize },
  ] : []

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <Breadcrumbs />
                  <h1 className="text-3xl font-bold tracking-tight truncate">Executive Dashboard</h1>
                  <p className="text-zinc-400 mt-1">Welcome back. Here&apos;s your business at a glance.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {lastUpdated && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500">Updated {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                  )}
                  <ExportCSV data={analyticsExportData} filename="mbpw-dashboard" label="CSV" />
                  <Button variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50" onClick={() => showToast("Dashboard exported as PDF")}>
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20" onClick={() => setShowInsightsModal(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> AI Insights
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRefresh("Dashboard")} disabled={refreshing === "Dashboard"} className="text-zinc-400 hover:text-white h-9 w-9 p-0">
                    <RefreshCw className={`w-4 h-4 ${refreshing === "Dashboard" ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                <WidgetSkeleton type="briefing" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <WidgetSkeleton key={i} type="card" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <WidgetSkeleton type="chart" />
                    <WidgetSkeleton type="list" />
                  </div>
                  <div className="space-y-6">
                    <WidgetSkeleton type="list" />
                    <WidgetSkeleton type="list" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ErrorBoundary name="Executive Briefing">
                  <ExecutiveBriefing briefing={briefing} loading={briefingLoading} onViewAll={() => setShowInsightsModal(true)} />
                </ErrorBoundary>

                <ErrorBoundary name="Stats Grid">
                  <StatsGrid totalRevenue={activeAnalytics?.totalRevenue || 0} leadsCount={currentLeads.length} conversionRate={activeAnalytics?.conversionRate || 0} />
                </ErrorBoundary>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6 min-w-0">
                    <ErrorBoundary name="Agent Fleet">
                      <div className="relative">
                        <button onClick={() => handleRefresh("Agents")} className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white transition-colors" aria-label="Refresh agents">
                          <RotateCcw className={`w-3.5 h-3.5 ${refreshing === "Agents" ? "animate-spin" : ""}`} />
                        </button>
                        <AgentFleet agents={currentAgents} activeAgentTab={activeAgentTab} isExpanded={agentViewExpanded} onTabChange={setActiveAgentTab} onToggleExpanded={setAgentViewExpanded} onAgentClick={(n) => showToast(`Viewing agent: ${n}`)} />
                      </div>
                    </ErrorBoundary>
                    <ErrorBoundary name="Activity Feed">
                      <ActivityFeed activities={currentActivities} isRefreshing={refreshing === "Activity"} onRefresh={() => handleRefresh("Activity")} onActivityClick={(d) => showToast(`Activity: ${d.slice(0, 60)}...`)} />
                    </ErrorBoundary>
                    <ErrorBoundary name="Revenue Overview">
                      <RevenueOverview revenueData={revenueData} showDetails={showRevenueDetails} onToggleDetails={() => setShowRevenueDetails(!showRevenueDetails)} />
                    </ErrorBoundary>
                  </div>
                  <div className="space-y-6 min-w-0">
                    <ErrorBoundary name="Lead Pipeline">
                      <LeadPipeline leads={currentLeads} selectedLeadId={selectedLeadId} sortBy={sortBy} filterSource={filterSource} searchQuery={searchQuery} onSortChange={setSortBy} onFilterSourceChange={setFilterSource} onSearchChange={setSearchQuery} onLeadSelect={setSelectedLeadId} onSourceClick={(n) => showToast(`Filtering by: ${n}`)} />
                    </ErrorBoundary>
                    <ErrorBoundary name="Notifications Panel">
                      <NotificationsPanel notifications={currentNotifications} expandedNotificationId={expandedNotificationId} onToggleExpand={handleNotificationExpand} onCollapse={() => setExpandedNotificationId(null)} onNotificationRead={() => showToast("Notification marked as read")} />
                    </ErrorBoundary>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="AI Insights">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInsightsModal(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-900/50 overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"><Sparkles className="w-5 h-5 text-white" /></div>
                <div>
                  <h2 className="text-lg font-bold">AI Insights</h2>
                  <p className="text-xs text-zinc-400">Powered by MBPW Intelligence</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => setShowInsightsModal(false)} aria-label="Close insights"><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {loadingInsights ? (
                <div className="flex items-center justify-center py-8" role="status">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-zinc-400">Generating AI insights...</span>
                </div>
              ) : aiInsights ? (
                <>
                  {aiInsights.summary && (
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                      <p className="text-sm text-cyan-300/80">{aiInsights.summary}</p>
                    </div>
                  )}
                  {aiInsights.top_recommendations?.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium">Recommendation {i + 1}</span>
                      </div>
                      <p className="text-sm text-zinc-300">{rec}</p>
                    </div>
                  ))}
                  {aiInsights.risk_alerts?.map((alert, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium">Risk Alert</span>
                      </div>
                      <p className="text-sm text-zinc-300">{alert}</p>
                    </div>
                  ))}
                  {aiInsights.market_trends?.map((trend, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium">Market Trend</span>
                      </div>
                      <p className="text-sm text-zinc-300">{trend}</p>
                    </div>
                  ))}
                </>
              ) : (
                insightItems.map((item) => (
                  <div key={item.title} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className={`w-4 h-4 ${item.iconClass}`} />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <p className="text-sm text-zinc-300">{item.body}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-5 border-t border-zinc-800/50 flex justify-end">
              <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white" onClick={() => { setShowInsightsModal(false); showToast("Full report sent to your email") }}>
                <Send className="w-4 h-4 mr-2" /> Send Full Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
