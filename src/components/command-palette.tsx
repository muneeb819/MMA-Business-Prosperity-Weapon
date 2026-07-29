"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutDashboard, Globe, Target, FileText, Bell, Users, BarChart3, Cable, BookOpen, Sparkles, Settings, Star, LogOut, Moon, Sun, Command, ExternalLink, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

interface Command {
  id: string
  label: string
  description: string
  icon: any
  action: () => void
  shortcut?: string
  category: string
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const commands: Command[] = [
    { id: "dashboard", label: "Dashboard", description: "Go to executive dashboard", icon: LayoutDashboard, action: () => router.push("/"), shortcut: "⌘1", category: "Navigation" },
    { id: "opportunities", label: "Opportunity Hunter", description: "Find and discover opportunities", icon: Globe, action: () => router.push("/opportunity-hunter"), shortcut: "⌘2", category: "Navigation" },
    { id: "leads", label: "Leads", description: "View and manage leads", icon: Target, action: () => router.push("/leads"), shortcut: "⌘3", category: "Navigation" },
    { id: "proposals", label: "Proposals", description: "Create and manage proposals", icon: FileText, action: () => router.push("/proposals"), shortcut: "⌘4", category: "Navigation" },
    { id: "ai-search", label: "AI Search", description: "Natural language search", icon: Search, action: () => router.push("/ai-search"), shortcut: "⌘5", category: "Navigation" },
    { id: "connectors", label: "Connectors", description: "Manage data connectors", icon: Cable, action: () => router.push("/connectors"), shortcut: "⌘6", category: "Navigation" },
    { id: "knowledge", label: "Knowledge Base", description: "Manage knowledge entries", icon: BookOpen, action: () => router.push("/knowledge"), shortcut: "⌘7", category: "Navigation" },
    { id: "notifications", label: "Notifications", description: "View all notifications", icon: Bell, action: () => router.push("/notifications"), shortcut: "⌘8", category: "Navigation" },
    { id: "crm", label: "CRM", description: "Customer relationship management", icon: Users, action: () => router.push("/crm"), shortcut: "⌘9", category: "Navigation" },
    { id: "analytics", label: "Analytics", description: "View business analytics", icon: BarChart3, action: () => router.push("/analytics"), shortcut: "⌘0", category: "Navigation" },
    { id: "export", label: "Export Dashboard", description: "Export current dashboard as CSV/PDF", icon: ExternalLink, action: () => { document.dispatchEvent(new CustomEvent("mbpw:export")) }, category: "Actions" },
    { id: "settings", label: "Settings", description: "Configure your preferences", icon: Settings, action: () => router.push("/settings"), category: "Actions" },
    { id: "favorites", label: "Favorites", description: "View your saved favorites", icon: Star, action: () => router.push("/favorites"), category: "Actions" },
    { id: "toggle-theme", label: theme === "dark" ? "Light Mode" : "Dark Mode", description: `Switch to ${theme === "dark" ? "light" : "dark"} theme`, icon: theme === "dark" ? Sun : Moon, action: () => toggleTheme(), category: "Preferences" },
    { id: "logout", label: "Log Out", description: `Sign out as ${user?.email || "user"}`, icon: LogOut, action: () => logout().then(() => router.push("/login")), category: "Account" },
    { id: "ai-insights", label: "AI Insights", description: "Generate AI-powered business insights", icon: Sparkles, action: () => { document.dispatchEvent(new CustomEvent("mbpw:ai-insights")) }, category: "Actions" },
  ]

  const filtered = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === "Enter" && filtered[selectedIndex]) { filtered[selectedIndex].action(); onClose() }
    if (e.key === "Escape") { onClose() }
  }, [filtered, selectedIndex, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onClose() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  if (!open) return null

  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-zinc-900/50 overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 h-14 border-b border-zinc-800/50">
          <Command className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, actions, and settings..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700">
            <span className="text-[10px] text-zinc-500">ESC</span>
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin p-2">
          {Object.entries(grouped).length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No results for &quot;{query}&quot;</div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{category}</div>
                {items.map((cmd, idx) => {
                  const globalIdx = filtered.indexOf(cmd)
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); onClose() }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                        globalIdx === selectedIndex ? "bg-cyan-500/10 text-cyan-300" : "text-zinc-300 hover:bg-zinc-800/50"
                      )}
                    >
                      <cmd.icon className={cn("w-4 h-4 shrink-0", globalIdx === selectedIndex ? "text-cyan-400" : "text-zinc-500")} />
                      <div className="flex-1 text-left">
                        <span className="font-medium">{cmd.label}</span>
                        <span className="text-xs text-zinc-500 ml-2">{cmd.description}</span>
                      </div>
                      {cmd.shortcut && <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded border border-zinc-700">{cmd.shortcut}</kbd>}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-zinc-800/50 flex items-center gap-4 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1">↑↓ <span className="text-zinc-500">Navigate</span></span>
          <span className="flex items-center gap-1">↵ <span className="text-zinc-500">Open</span></span>
          <span className="flex items-center gap-1">ESC <span className="text-zinc-500">Close</span></span>
        </div>
      </div>
    </div>
  )
}
