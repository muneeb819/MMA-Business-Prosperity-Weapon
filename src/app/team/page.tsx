"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { GlassCard, GlassCardContent } from "@/components/glass-card"
import { Mail, Phone, Calendar, Award, TrendingUp } from "lucide-react"

const teamMembers = [
  { name: "Alex Morgan", role: "CEO / Founder", email: "alex@mbpw.com", phone: "+1 (555) 0101", deals: 28, revenue: "$2.4M", avatar: "AM", color: "from-blue-500 to-blue-600" },
  { name: "Sarah Chen", role: "Head of Sales", email: "sarah@mbpw.com", phone: "+1 (555) 0102", deals: 42, revenue: "$3.8M", avatar: "SC", color: "from-purple-500 to-purple-600" },
  { name: "Marcus Johnson", role: "Lead Developer", email: "marcus@mbpw.com", phone: "+1 (555) 0103", deals: 15, revenue: "$1.2M", avatar: "MJ", color: "from-emerald-500 to-emerald-600" },
  { name: "Emily Watson", role: "Marketing Director", email: "emily@mbpw.com", phone: "+1 (555) 0104", deals: 22, revenue: "$1.8M", avatar: "EW", color: "from-orange-500 to-orange-600" },
  { name: "David Park", role: "AI Engineer", email: "david@mbpw.com", phone: "+1 (555) 0105", deals: 18, revenue: "$1.5M", avatar: "DP", color: "from-pink-500 to-pink-600" },
  { name: "Lisa Rodriguez", role: "Customer Success", email: "lisa@mbpw.com", phone: "+1 (555) 0106", deals: 35, revenue: "$2.9M", avatar: "LR", color: "from-cyan-500 to-cyan-600" },
]

const performanceData = [
  { name: "Alex Morgan", value: 95 },
  { name: "Sarah Chen", value: 100 },
  { name: "Marcus Johnson", value: 78 },
  { name: "Emily Watson", value: 88 },
  { name: "David Park", value: 82 },
  { name: "Lisa Rodriguez", value: 92 },
]

export default function TeamPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <PageTransition>
            <div className="space-y-6">
              <Breadcrumbs />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Team
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Team members & performance</p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member, i) => (
                  <StaggerItem key={i}>
                    <GlassCard glow="blue" className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" /> {member.deals} deals
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> {member.revenue}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all">
                          <Mail className="w-3 h-3" /> Email
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all">
                          <Phone className="w-3 h-3" /> Call
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all">
                          <Calendar className="w-3 h-3" /> Schedule
                        </button>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <GlassCard glow="emerald">
                <GlassCardContent>
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Team Performance
                  </h2>
                  <div className="space-y-3">
                    {performanceData.map((member, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground w-24 truncate">{member.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                            style={{ width: `${member.value}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{member.value}%</span>
                      </div>
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
