"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/glass-card"
import { AnimatedCounter } from "@/components/animated-counter"
import { Shield, Users, Database, Activity, Settings, RefreshCw } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

interface SystemStats {
  total_leads: number; total_proposals: number; total_users: number
  active_sessions: number; total_companies: number; total_contacts: number
  total_notifications: number; total_agent_logs: number; total_knowledge_entries: number
  today_leads: number; today_proposals: number; system_uptime: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("mbpw_token")
    if (!token) { setLoading(false); return }
    fetch(`${API_BASE}/api/admin/system/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "blue" },
    { label: "Active Sessions", value: stats?.active_sessions ?? 0, icon: Activity, color: "emerald" },
    { label: "Total Leads", value: stats?.total_leads ?? 0, icon: Database, color: "purple" },
    { label: "Total Proposals", value: stats?.total_proposals ?? 0, icon: Shield, color: "blue" },
    { label: "Today Leads", value: stats?.today_leads ?? 0, icon: Activity, color: "emerald" },
    { label: "Companies", value: stats?.total_companies ?? 0, icon: Database, color: "purple" },
    { label: "Knowledge Entries", value: stats?.total_knowledge_entries ?? 0, icon: Database, color: "blue" },
    { label: "Agent Actions", value: stats?.total_agent_logs ?? 0, icon: Settings, color: "emerald" },
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
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">System administration & monitoring</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Live
                </div>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                  <StaggerItem key={i}>
                    <GlassCard glow={card.color as any} className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                          <p className="text-3xl font-bold mt-2 text-foreground">
                            {loading ? (
                              <span className="inline-block w-12 h-8 rounded bg-muted animate-pulse" />
                            ) : (
                              <AnimatedCounter end={card.value} />
                            )}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <card.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard glow="blue">
                  <GlassCardHeader>
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" /> System Overview
                    </h2>
                  </GlassCardHeader>
                  <GlassCardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : stats ? (
                      <div className="space-y-3 text-sm">
                        {[
                          ["System Status", stats.system_uptime],
                          ["Total Contacts", stats.total_contacts],
                          ["Notifications", stats.total_notifications],
                          ["Today Proposals", stats.today_proposals],
                          ["Knowledge Base", stats.total_knowledge_entries],
                        ].map(([label, value], i) => (
                          <div key={i} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="text-foreground font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Connect to backend to view stats</p>
                    )}
                  </GlassCardContent>
                </GlassCard>

                <GlassCard glow="purple">
                  <GlassCardHeader>
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-400" /> Quick Actions
                    </h2>
                  </GlassCardHeader>
                  <GlassCardContent className="space-y-2">
                    {[
                      { label: "Seed Database", desc: "Generate sample data", color: "bg-blue-400" },
                      { label: "Cleanup Sessions", desc: "Remove expired sessions", color: "bg-emerald-400" },
                      { label: "Export Audit Logs", desc: "Download system audit trail", color: "bg-purple-400" },
                      { label: "System Health Check", desc: "Verify all services", color: "bg-blue-400" },
                    ].map((action, i) => (
                      <button
                        key={i}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all text-left"
                      >
                        <div>
                          <p className="text-sm text-foreground font-medium">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${action.color} animate-pulse`} />
                      </button>
                    ))}
                  </GlassCardContent>
                </GlassCard>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
