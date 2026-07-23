"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Globe,
  Search,
  FileText,
  Bell,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Target,
  Bot,
  Activity,
  Sparkles,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "from-blue-500 to-cyan-400" },
  { name: "Opportunity Hunter", href: "/opportunity-hunter", icon: Globe, color: "from-cyan-500 to-blue-500" },
  { name: "Leads", href: "/leads", icon: Target, color: "from-emerald-500 to-teal-400" },
  { name: "Proposals", href: "/proposals", icon: FileText, color: "from-violet-500 to-purple-400" },
  { name: "AI Search", href: "/ai-search", icon: Search, color: "from-amber-500 to-orange-400" },
  { name: "Notifications", href: "/notifications", icon: Bell, color: "from-rose-500 to-pink-400" },
  { name: "CRM", href: "/crm", icon: Users, color: "from-indigo-500 to-blue-400" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, color: "from-purple-500 to-violet-400" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white font-bold text-lg shrink-0 shadow-lg shadow-blue-500/20">
          M
          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm leading-tight text-gradient">MMA Business</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Prosperity Weapon</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative animate-fade-in-up",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500" />
              )}
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all duration-200",
                isActive
                  ? `bg-gradient-to-br ${item.color} text-white shadow-md`
                  : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* AI Agent Status */}
      <div className="p-2.5 border-t border-border/50">
        <div className={cn(
          "rounded-xl overflow-hidden",
          collapsed ? "p-2" : "p-3"
        )}>
          {!collapsed ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gradient">AI Agents</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground">3 agents running</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground">94.7% efficiency</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-medium">All systems operational</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border/50 bg-card flex items-center justify-center shadow-md hover:bg-muted transition-all duration-200 hover:scale-110"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  )
}
