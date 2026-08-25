"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Globe,
  FileText,
  Users,
  BarChart3,
  Target,
  Bot,
  Activity,
  Menu,
  Cable,
  LineChart,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "from-blue-500 to-cyan-400" },
  { name: "Opportunity Hunter", href: "/opportunity-hunter", icon: Globe, color: "from-cyan-500 to-blue-500" },
  { name: "AI Teams", href: "/ai-teams", icon: Bot, color: "from-violet-500 to-purple-500" },
  { name: "Leads", href: "/leads", icon: Target, color: "from-emerald-500 to-rose-400" },
  { name: "Proposals", href: "/proposals", icon: FileText, color: "from-violet-500 to-purple-400" },
  { name: "Connectors", href: "/connectors", icon: Cable, color: "from-indigo-500 to-rose-500" },
  { name: "CRM", href: "/crm", icon: Users, color: "from-indigo-500 to-blue-400" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, color: "from-purple-500 to-violet-400" },
  { name: "Reports", href: "/reports", icon: LineChart, color: "from-emerald-500 to-rose-400" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setExpanded(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setExpanded(false), 200)
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const handler = () => setMobileOpen((prev) => !prev)
    window.addEventListener("mbpw:toggle-sidebar", handler)
    return () => window.removeEventListener("mbpw:toggle-sidebar", handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden h-10 w-10 rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center shadow-lg hover:bg-muted/50 transition-all"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "h-screen border-r border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 flex flex-col",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-64 max-md:z-50",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:relative md:shrink-0",
          expanded ? "md:w-64" : "md:w-[72px]"
        )}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20">
            <img src="/logo.jpg" alt="MBPW" className="w-full h-full object-cover" />
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
          </div>
          {expanded && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-sm leading-tight text-gradient">MMA Business</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Prosperity Weapon</span>
            </div>
          )}
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-all shrink-0"
              aria-label="Close menu"
            >
              <span className="text-muted-foreground text-lg">&times;</span>
            </button>
          )}
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-hidden">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500" />
                )}
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all duration-200",
                  active
                    ? `bg-gradient-to-br ${item.color} text-white shadow-md`
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                {expanded && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-2.5 border-t border-border/50 shrink-0">
          <div className={cn(
            "rounded-xl overflow-hidden",
            expanded ? "p-3" : "p-2"
          )}>
            {expanded ? (
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
      </aside>
    </>
  )
}
