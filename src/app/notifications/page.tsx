"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { timeAgo, cn } from "@/lib/utils"
import { mockNotifications } from "@/lib/mock-data"
import { Notification } from "@/lib/types"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Clock,
  Globe,
  Users,
  Zap,
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Target,
  Building2,
  Mail,
  Sparkles,
  Bot,
  Star,
  ArrowUpRight,
  Check,
} from "lucide-react"

const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  high_value: { icon: <DollarSign className="h-4 w-4" />, color: "bg-emerald-500/10 text-emerald-600", label: "High Value" },
  urgent: { icon: <AlertTriangle className="h-4 w-4" />, color: "bg-red-500/10 text-red-600", label: "Urgent" },
  government: { icon: <Building2 className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600", label: "Government" },
  enterprise: { icon: <Globe className="h-4 w-4" />, color: "bg-violet-500/10 text-violet-600", label: "Enterprise" },
  follow_up: { icon: <Mail className="h-4 w-4" />, color: "bg-amber-500/10 text-amber-600", label: "Follow-up" },
  system: { icon: <Settings className="h-4 w-4" />, color: "bg-gray-500/10 text-gray-600", label: "System" },
  agent: { icon: <Bot className="h-4 w-4" />, color: "bg-cyan-500/10 text-cyan-600", label: "Agent" },
}

const priorityConfig: Record<string, { color: string; dot: string }> = {
  high: { color: "bg-red-500/10 text-red-600 border-red-500/20", dot: "bg-red-500" },
  medium: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", dot: "bg-amber-500" },
  low: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", dot: "bg-blue-500" },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filterType, setFilterType] = useState("all")

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const filteredNotifications = filterType === "all"
    ? notifications
    : filterType === "unread"
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filterType)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount} unread notifications · {notifications.length} total
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" /> Preferences
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setFilterType("all")}>
              <CardContent className="p-4 text-center">
                <Bell className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setFilterType("unread")}>
              <CardContent className="p-4 text-center">
                <EyeOff className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setFilterType("high_value")}>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-600">{notifications.filter(n => n.type === "high_value").length}</p>
                <p className="text-xs text-muted-foreground">High Value</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setFilterType("urgent")}>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-600">{notifications.filter(n => n.type === "urgent").length}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-360px)]">
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const typeCfg = typeConfig[notif.type] || typeConfig.system
                const priCfg = priorityConfig[notif.priority] || priorityConfig.low
                return (
                  <Card
                    key={notif.id}
                    className={cn(
                      "transition-all cursor-pointer hover:shadow-md group",
                      !notif.read && "border-primary/30 bg-primary/5"
                    )}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", typeCfg.color)}>
                          {typeCfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className={cn("font-semibold", !notif.read && "text-primary")}>{notif.title}</h4>
                                {!notif.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className={cn("text-[10px]", priCfg.color)}>
                                <div className={cn("h-1.5 w-1.5 rounded-full mr-1", priCfg.dot)} />
                                {notif.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline" className={cn("text-[10px]", typeCfg.color)}>
                              {typeCfg.icon}
                              <span className="ml-1">{typeCfg.label}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />{timeAgo(new Date(notif.createdAt))}
                            </span>
                            {notif.leadId && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                <Target className="h-3 w-3 mr-1" /> View Lead
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {filteredNotifications.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">All caught up!</h3>
                    <p className="text-sm text-muted-foreground mt-1">No notifications to display</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
