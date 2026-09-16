"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Zap,
  Command,
  AlertTriangle,
  DollarSign,
  Building2,
  Globe,
  Target,
  Bot,
  Clock,
  ExternalLink,
  X,
  History,
  ArrowRight,
  FileText,
  BarChart3,
  LineChart,
  Cable,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useFavorites } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { Star } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/utils"
import type { Notification } from "@/lib/types"
import { api } from "@/lib/api"

const typeIconMap: Record<Notification["type"], { icon: typeof Bell; color: string; bg: string }> = {
  high_value: { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  urgent: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10" },
  government: { icon: Building2, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  enterprise: { icon: Globe, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  follow_up: { icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
  system: { icon: Bot, color: "text-rose-400", bg: "bg-rose-500/10" },
  agent: { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10" },
  new_lead: { icon: Target, color: "text-indigo-400", bg: "bg-indigo-500/10" },
}

const RECENT_SEARCHES_KEY = "mbpw_recent_searches"
const MAX_RECENT = 6

const searchHints = [
  { label: "New leads this week", icon: Target, href: "/leads" },
  { label: "Pending proposals", icon: FileText, href: "/proposals" },
  { label: "CRM companies", icon: Building2, href: "/crm" },
  { label: "Analytics overview", icon: BarChart3, href: "/analytics" },
  { label: "Revenue reports", icon: LineChart, href: "/reports" },
  { label: "Active connectors", icon: Cable, href: "/connectors" },
]

function getNotificationRoute(notif: Notification): string {
  if (notif.leadId) return `/leads/${notif.leadId}`
  return "/"
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]")
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return
  const searches = getRecentSearches().filter((s) => s !== trimmed)
  searches.unshift(trimmed)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)))
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

export function TopBar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { favorites } = useFavorites()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("mbpw_notifications");
    if (stored) {
      try { setNotifications(JSON.parse(stored)); } catch {}
    }
    api.notifications.list().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((n: any) => ({
          ...n,
          leadId: n.leadId || n.lead_id || undefined,
          createdAt: n.createdAt || n.created_at || new Date().toISOString(),
        }));
        setNotifications(prev => {
          const merged = [...mapped, ...prev.filter(p => !mapped.find((m: any) => m.id === p.id))];
          localStorage.setItem("mbpw_notifications", JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(() => {});
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])
  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [searchFocused])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const displayName = user?.name || "Admin"
  const initials = getInitials(displayName)

  const performSearch = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    saveRecentSearch(trimmed)
    setRecentSearches(getRecentSearches())
    setSearchFocused(false)
    router.push(`/leads?q=${encodeURIComponent(trimmed)}`)
  }, [router])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch(searchQuery)
    } else if (e.key === "Escape") {
      setSearchFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleHintClick = (href: string) => {
    setSearchFocused(false)
    router.push(href)
  }

  const handleRemoveRecent = (query: string) => {
    const updated = recentSearches.filter((s) => s !== query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    setRecentSearches(updated)
  }

  const handleClearAllRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { metaKey: true, key: "k" }))
  }

  const handleNotificationClick = (notif: Notification) => {
    setNotifDropdownOpen(false)
    router.push(getNotificationRoute(notif))
  }

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    router.push("/login")
  }

  const showDropdown = searchFocused

  const filteredHints = searchQuery.trim()
    ? searchHints.filter((h) => h.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchHints

  return (
    <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between pl-14 pr-4 md:px-6 sticky top-0 z-30">
      <img src="/logo.jpg" alt="MBPW" className="hidden md:block h-9 w-9 rounded-lg object-contain shrink-0 mr-1" />
      <div className="flex items-center gap-4 flex-1" ref={searchRef}>
        <div className="relative max-w-lg w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
          <Input
            ref={inputRef}
            placeholder="Search anything... (?K)"
            className="pl-10 pr-12 bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:bg-muted/50 transition-all h-10 rounded-xl relative z-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSearchFocused(true)}
          />
          <button type="button" onClick={openCommandPalette} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 hover:bg-muted transition-colors z-10" aria-label="Open command palette (?K)">
            <Command className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">K</span>
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
              {recentSearches.length > 0 && !searchQuery.trim() && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recent Searches</span>
                    <button onClick={handleClearAllRecent} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
                  </div>
                  {recentSearches.map((query) => (
                    <button
                      key={query}
                      onClick={() => { setSearchQuery(query); performSearch(query) }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group/item text-left"
                    >
                      <History className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground group-hover/item:text-foreground truncate flex-1">{query}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveRecent(query) }}
                        className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                        aria-label={`Remove ${query} from recent searches`}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </button>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && !searchQuery.trim() && <div className="h-px bg-border/50 mx-3" />}

              <div className="p-2">
                <span className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {searchQuery.trim() ? "Suggestions" : "Quick Links"}
                </span>
                {filteredHints.length > 0 ? (
                  filteredHints.map((hint) => (
                    <button
                      key={hint.label}
                      onClick={() => handleHintClick(hint.href)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group/item text-left"
                    >
                      <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-muted transition-colors">
                        <hint.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover/item:text-foreground flex-1">{hint.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover/item:text-muted-foreground transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">No matching results</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-medium text-emerald-500">All Systems Online</span>
        </div>

        <ThemeToggle />

        <Button variant="ghost" size="icon" onClick={() => router.push("/favorites")} className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all" aria-label="Favorites">
          <Star className="h-4.5 w-4.5" />
          {favorites.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[14px] rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center font-bold px-1 shadow-lg shadow-amber-500/30">
              {favorites.length}
            </span>
          )}
        </Button>

        <DropdownMenu open={notifDropdownOpen} onOpenChange={setNotifDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all">
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-lg shadow-red-500/30 animate-scale-in">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px] rounded-xl border-border/50 shadow-xl p-0 overflow-hidden">
            <div className="p-3 pb-2 flex items-center justify-between border-b border-border/50">
              <DropdownMenuLabel className="font-semibold text-sm p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/20">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <ScrollArea className="max-h-[340px]">
              {recentNotifications.length > 0 ? (
                <div className="py-1">
                  {recentNotifications.map((notif) => {
                    const typeMeta = typeIconMap[notif.type] || typeIconMap.agent
                    const TypeIcon = typeMeta.icon
                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer",
                          "focus:bg-muted/50 focus:text-white",
                          !notif.read && "bg-muted/20 border-l-2 border-l-indigo-500/60"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", typeMeta.bg)}>
                          <TypeIcon className={cn("w-4 h-4", typeMeta.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-medium leading-tight truncate", !notif.read ? "text-white" : "text-muted-foreground")}>
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">{notif.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {timeAgo(new Date(notif.createdAt))}
                            </span>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-1.5" />
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No notifications yet</div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 px-2 h-10 rounded-xl hover:bg-muted/50 transition-all">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 via-rose-600 to-rose-500 text-white text-xs font-bold shadow-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold leading-none">{displayName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{user?.role || "Admin"}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-xl">
            <DropdownMenuLabel className="font-semibold text-xs">
              <div>{displayName}</div>
              <div className="text-muted-foreground font-normal mt-0.5">{user?.email || "admin@mbpw.com"}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => { setUserMenuOpen(false); router.push("/settings") }}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => { setUserMenuOpen(false); router.push("/settings") }}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => { setUserMenuOpen(false); router.push("/settings") }}>
              <Zap className="mr-2 h-4 w-4" /> Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-500/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
