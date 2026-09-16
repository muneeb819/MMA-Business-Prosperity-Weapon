"use client"

import { cn } from "@/lib/utils"
import { Inbox, Search, Globe, FileText, Users, Bell, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const illustrations: Record<string, { icon: any; gradient: string }> = {
  default: { icon: Inbox, gradient: "from-zinc-500/20 to-zinc-600/20" },
  search: { icon: Search, gradient: "from-indigo-500/20 to-rose-500/20" },
  leads: { icon: Globe, gradient: "from-emerald-500/20 to-rose-500/20" },
  proposals: { icon: FileText, gradient: "from-rose-500/20 to-rose-500/20" },
  crm: { icon: Users, gradient: "from-indigo-500/20 to-rose-500/20" },
  notifications: { icon: Bell, gradient: "from-rose-500/20 to-rose-500/20" },
  analytics: { icon: BarChart3, gradient: "from-rose-500/20 to-rose-500/20" },
}

interface EmptyStateProps {
  type?: keyof typeof illustrations
  title: string
  description: string
  action?: { label: string; href: string }
  className?: string
}

export function EmptyState({ type = "default", title, description, action, className }: EmptyStateProps) {
  const router = useRouter()
  const ill = illustrations[type] || illustrations.default
  const Icon = ill.icon

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
      <div className={cn("relative w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br", ill.gradient, "flex items-center justify-center")}>
        <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br", ill.gradient, "animate-pulse opacity-50")} />
        <Icon className="relative w-7 h-7 text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-300 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-xs mb-4">{description}</p>
      {action && (
        <Button size="sm" variant="outline" onClick={() => router.push(action.href)} className="border-zinc-800 hover:bg-zinc-800/50 text-xs h-8">
          {action.label}
        </Button>
      )}
    </div>
  )
}
