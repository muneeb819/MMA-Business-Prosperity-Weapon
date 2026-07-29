"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Search,
  Settings,
  User,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useFavorites } from "@/lib/favorites-context"
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
import { mockNotifications } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/utils"
import type { Notification } from "@/lib/types"

const typeIconMap: Record<Notification["type"], { icon: typeof Bell; color: string; bg: string }> = {
  high_value: { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  urgent: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10" },
  government: { icon: Building2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  enterprise: { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
  follow_up: { icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
  system: { icon: Bot, color: "text-purple-400", bg: "bg-purple-500/10" },
  agent: { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10" },
}

function getNotificationRoute(notif: Notification): string {
  if (notif.leadId) return `/leads/${notif.leadId}`
  return "/notifications"
}

export function TopBar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const { favorites } = useFavorites()

  const unreadCount = useMemo(() => mockNotifications.filter(n => !n.read).length, [])
  const recentNotifications = useMemo(() => mockNotifications.slice(0, 5), [])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/ai-search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { metaKey: true, key: "k" }))
  }

  const handleNotificationClick = (notif: Notification) => {
    setNotifDropdownOpen(false)
    router.push(getNotificationRoute(notif))
  }

  return (
    <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-lg w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search anything... (⌘K)"
            className="pl-10 pr-12 bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:bg-muted/50 transition-all h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="button" onClick={openCommandPalette} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 hover:bg-muted transition-colors" aria-label="Open command palette (⌘K)">
            <Command className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">K</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-medium text-emerald-500">All Systems Online</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Favorites */}
        <Button variant="ghost" size="icon" onClick={() => router.push("/favorites")} className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all" aria-label="Favorites">
          <Star className="h-4.5 w-4.5" />
          {favorites.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[14px] rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center font-bold px-1 shadow-lg shadow-amber-500/30">
              {favorites.length}
            </span>
          )}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu open={notifDropdownOpen} onOpenChange={setNotifDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all"
            >
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
                    const typeMeta = typeIconMap[notif.type]
                    const TypeIcon = typeMeta.icon
                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer",
                          "focus:bg-muted/50 focus:text-white",
                          !notif.read && "bg-muted/20 border-l-2 border-l-cyan-500/60"
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
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            )}
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

            <div className="border-t border-border/50 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setNotifDropdownOpen(false); router.push("/notifications") }}
                className="w-full text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg h-9 font-medium"
              >
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                View All Notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 px-2 h-10 rounded-xl hover:bg-muted/50 transition-all">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white text-xs font-bold shadow-lg">
                  MB
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold leading-none">Admin</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">CEO</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-xl">
            <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => console.log("Profile clicked")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => console.log("Settings clicked")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => console.log("Billing clicked")}>
              <Zap className="mr-2 h-4 w-4" /> Billing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
