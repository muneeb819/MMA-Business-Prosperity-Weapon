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
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Briefcase,
  MessageSquare,
  Bot,
  Activity,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Opportunity Hunter", href: "/opportunity-hunter", icon: Globe },
  { name: "Leads", href: "/leads", icon: Target },
  { name: "Proposals", href: "/proposals", icon: FileText },
  { name: "AI Search", href: "/ai-search", icon: Search },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "CRM", href: "/crm", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg shrink-0">
          M
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm leading-tight truncate">MMA Business</span>
            <span className="text-[10px] text-muted-foreground leading-tight truncate">Prosperity Weapon</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        <div className={cn(
          "rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3",
          collapsed && "p-2"
        )}>
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">AI Agents Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span className="text-[11px] text-muted-foreground">3 agents running</span>
              </div>
            </div>
          ) : (
            <Bot className="h-5 w-5 text-primary mx-auto" />
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background flex items-center justify-center shadow-md hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  )
}
