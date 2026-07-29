"use client"

import { useEffect, useState } from "react"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/glass-card"
import { AnimatedCounter } from "@/components/animated-counter"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import { Shield, Users, Database, Activity, LogOut, Settings, RefreshCw } from "lucide-react"

interface SystemStats {
  total_leads: number; total_proposals: number; total_users: number
  active_sessions: number; total_companies: number; total_contacts: number
  total_notifications: number; total_agent_logs: number; total_knowledge_entries: number
  today_leads: number; today_proposals: number; system_uptime: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem("mbpw_token"))
  }, [])

  useEffect(() => {
    if (!token) return
    fetch("http://localhost:8001/api/admin/system/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const statCards = [
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "blue", suffix: "" },
    { label: "Active Sessions", value: stats?.active_sessions ?? 0, icon: Activity, color: "emerald", suffix: "" },
    { label: "Total Leads", value: stats?.total_leads ?? 0, icon: Database, color: "purple", suffix: "" },
    { label: "Total Proposals", value: stats?.total_proposals ?? 0, icon: Shield, color: "blue", suffix: "" },
    { label: "Today Leads", value: stats?.today_leads ?? 0, icon: Activity, color: "emerald", suffix: "" },
    { label: "Companies", value: stats?.total_companies ?? 0, icon: Database, color: "purple", suffix: "" },
    { label: "Knowledge Entries", value: stats?.total_knowledge_entries ?? 0, icon: Database, color: "blue", suffix: "" },
    { label: "Agent Actions", value: stats?.total_agent_logs ?? 0, icon: Settings, color: "emerald", suffix: "" },
  ]

  return (
    <>
      <Breadcrumbs />
      <PageTransition>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-sm text-white/40 mt-1">System administration & monitoring</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/30">
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
                      <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
                      <p className="text-3xl font-bold mt-2 text-white">
                        {loading ? (
                          <span className="inline-block w-12 h-8 rounded bg-white/5 animate-pulse" />
                        ) : (
                          <AnimatedCounter end={card.value} />
                        )}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <card.icon className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard glow="blue">
              <GlassCardHeader>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" /> System Overview
                </h2>
              </GlassCardHeader>
              <GlassCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
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
                      <div key={i} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                        <span className="text-white/40">{label}</span>
                        <span className="text-white/80 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Connect to backend to view stats</p>
                )}
              </GlassCardContent>
            </GlassCard>

            <GlassCard glow="purple">
              <GlassCardHeader>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" /> Quick Actions
                </h2>
              </GlassCardHeader>
              <GlassCardContent className="space-y-2">
                {[
                  { label: "Seed Database", desc: "Generate sample data", color: "blue" },
                  { label: "Cleanup Sessions", desc: "Remove expired sessions", color: "emerald" },
                  { label: "Export Audit Logs", desc: "Download system audit trail", color: "purple" },
                  { label: "System Health Check", desc: "Verify all services", color: "blue" },
                ].map((action, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left"
                  >
                    <div>
                      <p className="text-sm text-white/80 font-medium">{action.label}</p>
                      <p className="text-xs text-white/40">{action.desc}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full bg-${action.color}-400 animate-pulse`} />
                  </button>
                ))}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  )
}
