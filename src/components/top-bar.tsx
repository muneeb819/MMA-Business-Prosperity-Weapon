"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Settings, User, ChevronDown, Zap, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockNotifications } from "@/lib/mock-data"

export function TopBar() {
  const router = useRouter()
  const unreadCount = mockNotifications.filter(n => !n.read).length
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/ai-search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50">
            <Command className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mr-1">
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-medium text-emerald-500">All Systems Online</span>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all"
          onClick={() => router.push("/notifications")}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-lg shadow-red-500/30 animate-scale-in">
              {unreadCount}
            </span>
          )}
        </Button>

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
