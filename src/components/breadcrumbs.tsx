"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, LayoutDashboard, Globe, Target, FileText, Search, Bell, Users, BarChart3, Home, Cable, BookOpen, Star, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, any> = {
  "": LayoutDashboard,
  "opportunity-hunter": Globe,
  leads: Target,
  proposals: FileText,
  "ai-search": Search,
  notifications: Bell,
  crm: Users,
  analytics: BarChart3,
  connectors: Cable,
  knowledge: BookOpen,
  favorites: Star,
  settings: Settings,
}

const labelMap: Record<string, string> = {
  "": "Dashboard",
  "opportunity-hunter": "Opportunity Hunter",
  leads: "Leads",
  proposals: "Proposals",
  "ai-search": "AI Search",
  notifications: "Notifications",
  crm: "CRM",
  analytics: "Analytics",
  connectors: "Connectors",
  knowledge: "Knowledge Base",
  favorites: "Favorites",
  settings: "Settings",
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (pathname === "/login") return null

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs text-zinc-500 mb-4", className)}>
      <Link href="/" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
        <Home className="w-3 h-3" />
      </Link>
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const Icon = iconMap[seg] || LayoutDashboard
        const label = labelMap[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        const isLast = i === segments.length - 1
        return (
          <div key={seg} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            {isLast ? (
              <span className="flex items-center gap-1 text-zinc-300 font-medium">
                <Icon className="w-3 h-3" />
                {label}
              </span>
            ) : (
              <Link href={href} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                <Icon className="w-3 h-3" />
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
