"use client"

import { useState } from "react"
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
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Download } from "lucide-react"

const pipelineData = [
  { name: "New", value: 24, color: "#3b82f6" },
  { name: "Contacted", value: 18, color: "#8b5cf6" },
  { name: "Qualified", value: 12, color: "#ec4899" },
  { name: "Proposal", value: 8, color: "#f59e0b" },
  { name: "Negotiation", value: 5, color: "#10b981" },
  { name: "Won", value: 3, color: "#059669" },
]

const revenueData = [
  { month: "Jan", revenue: 45000, target: 50000 },
  { month: "Feb", revenue: 52000, target: 50000 },
  { month: "Mar", revenue: 48000, target: 55000 },
  { month: "Apr", revenue: 61000, target: 55000 },
  { month: "May", revenue: 58000, target: 60000 },
  { month: "Jun", revenue: 72000, target: 60000 },
]

const leadTrendData = [
  { day: "Mon", leads: 12, qualified: 8 },
  { day: "Tue", leads: 19, qualified: 11 },
  { day: "Wed", leads: 15, qualified: 9 },
  { day: "Thu", leads: 22, qualified: 14 },
  { day: "Fri", leads: 18, qualified: 10 },
  { day: "Sat", leads: 8, qualified: 4 },
  { day: "Sun", leads: 5, qualified: 2 },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState("30d")

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
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
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
                  <button className="p-2 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-all">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Pipeline Value", value: 284000, icon: DollarSign, change: "+12.5%", up: true, color: "emerald" },
                  { label: "Conversion Rate", value: 24.8, icon: Target, change: "+3.2%", up: true, suffix: "%", color: "blue" },
                  { label: "Avg. Deal Size", value: 12400, icon: Activity, change: "-2.1%", up: false, prefix: "$", color: "purple" },
                  { label: "Win Rate", value: 68.3, icon: TrendingUp, change: "+5.7%", up: true, suffix: "%", color: "emerald" },
                ].map((stat, i) => (
                  <StaggerItem key={i}>
                    <GlassCard className="p-5" glow={stat.color as any}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                          <p className="text-2xl font-bold mt-2 text-foreground">
                            {stat.prefix || ""}<AnimatedCounter end={stat.value} decimals={stat.value % 1 !== 0 ? 1 : 0} />{stat.suffix || ""}
                          </p>
                          <p className={`text-xs mt-1 flex items-center gap-1 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                            {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stat.change}
                          </p>
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
                <GlassCard glow="blue">
                  <GlassCardHeader>
                    <h2 className="text-sm font-semibold text-foreground">Revenue vs Target</h2>
                  </GlassCardHeader>
                  <GlassCardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="target" stroke="#8b5cf6" strokeDasharray="5 5" strokeWidth={2} fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </GlassCardContent>
                </GlassCard>

                <GlassCard glow="purple">
                  <GlassCardHeader>
                    <h2 className="text-sm font-semibold text-foreground">Pipeline Stages</h2>
                  </GlassCardHeader>
                  <GlassCardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                          {pipelineData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {pipelineData.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </div>

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
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
