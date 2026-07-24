"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { mockAgents, mockLeads, mockNotifications, mockActivityLog, mockAnalytics } from "@/lib/mock-data"
import { Download, Sparkles, X, TrendingUp, AlertTriangle, Brain, Send, CheckCircle } from "lucide-react"
import { useState, useCallback } from "react"
import { StatsGrid } from "@/components/dashboard/StatsGrid"
import { RevenueOverview } from "@/components/dashboard/RevenueOverview"
import { AgentFleet } from "@/components/dashboard/AgentFleet"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { LeadPipeline } from "@/components/dashboard/LeadPipeline"
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel"

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
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

const insightItems = [
  { icon: TrendingUp, iconClass: "text-emerald-400", title: "Revenue Opportunity", body: "3 government contracts worth $1.2M total show 89% success probability. Recommend immediate outreach." },
  { icon: AlertTriangle, iconClass: "text-amber-400", title: "Risk Alert", body: 'Enterprise lead "TechCorp" has decreased engagement score by 15%. Follow-up recommended within 24 hours.' },
  { icon: Brain, iconClass: "text-violet-400", title: "Agent Optimization", body: "Lead Scanning Agent efficiency improved 12% this week. Task queue processing at optimal levels." },
]

export default function DashboardPage() {
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
  const [isRefreshingActivity, setIsRefreshingActivity] = useState(false)

  const showToast = useCallback((msg: string) => setToastMessage(msg), [])

  const handleRefreshActivity = useCallback(() => {
    setIsRefreshingActivity(true)
    setTimeout(() => { setIsRefreshingActivity(false); showToast("Activity feed refreshed") }, 1000)
  }, [showToast])

  const handleNotificationExpand = useCallback((id: string) => {
    setExpandedNotificationId((prev) => (prev === id ? null : id))
  }, [])

  const maxMonthlyRevenue = Math.max(...mockAnalytics.monthlyRevenue.map((m) => m.revenue))
  const revenueData = mockAnalytics.monthlyRevenue.map((m) => ({ label: m.month, value: m.revenue, max: maxMonthlyRevenue }))

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight truncate">Executive Dashboard</h1>
                  <p className="text-zinc-400 mt-1">Welcome back. Here&apos;s your business at a glance.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50" onClick={() => showToast("Dashboard exported as PDF")}>
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20" onClick={() => setShowInsightsModal(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> AI Insights
                  </Button>
                </div>
              </div>
            </div>

            <StatsGrid totalRevenue={mockAnalytics.totalRevenue} leadsCount={mockLeads.length} conversionRate={mockAnalytics.conversionRate} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6 min-w-0">
                <AgentFleet agents={mockAgents} activeAgentTab={activeAgentTab} isExpanded={agentViewExpanded} onTabChange={setActiveAgentTab} onToggleExpanded={setAgentViewExpanded} onAgentClick={(n) => showToast(`Viewing agent: ${n}`)} />
                <ActivityFeed activities={mockActivityLog} isRefreshing={isRefreshingActivity} onRefresh={handleRefreshActivity} onActivityClick={(d) => showToast(`Activity: ${d.slice(0, 60)}...`)} />
                <RevenueOverview revenueData={revenueData} showDetails={showRevenueDetails} onToggleDetails={() => setShowRevenueDetails(!showRevenueDetails)} />
              </div>
              <div className="space-y-6 min-w-0">
                <LeadPipeline leads={mockLeads} selectedLeadId={selectedLeadId} sortBy={sortBy} filterSource={filterSource} searchQuery={searchQuery} onSortChange={setSortBy} onFilterSourceChange={setFilterSource} onSearchChange={setSearchQuery} onLeadSelect={setSelectedLeadId} onSourceClick={(n) => showToast(`Filtering by: ${n}`)} />
                <NotificationsPanel notifications={mockNotifications} expandedNotificationId={expandedNotificationId} onToggleExpand={handleNotificationExpand} onCollapse={() => setExpandedNotificationId(null)} onNotificationRead={() => showToast("Notification marked as read")} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => setShowInsightsModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {insightItems.map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`w-4 h-4 ${item.iconClass}`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{item.body}</p>
                </div>
              ))}
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
