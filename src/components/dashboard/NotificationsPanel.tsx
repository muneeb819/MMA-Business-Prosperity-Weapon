"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Bot, CheckCircle, AlertTriangle, Info, Target } from "lucide-react"
import { timeAgo, cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"

function NotificationIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    high_value: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    urgent: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    government: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    enterprise: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    follow_up: <Info className="w-4 h-4 text-cyan-400" />,
    system: <Info className="w-4 h-4 text-cyan-400" />,
    agent: <Bot className="w-4 h-4 text-violet-400" />,
  }
  return <>{iconMap[type] || iconMap.system}</>
}

interface NotificationsPanelProps {
  notifications: Notification[]
  expandedNotificationId: string | null
  onToggleExpand: (id: string) => void
  onCollapse: () => void
  onNotificationRead: (id: string) => void
}

const NotificationsPanel = React.memo(function NotificationsPanel({
  notifications,
  expandedNotificationId,
  onToggleExpand,
  onCollapse,
  onNotificationRead,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                Recent alerts and updates
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {expandedNotificationId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white text-xs"
                onClick={onCollapse}
              >
                Collapse
              </Button>
            )}
            <Badge
              variant="secondary"
              className="bg-amber-500/10 text-amber-400 border-amber-500/20"
            >
              {unreadCount} new
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-2">
            {notifications.map((notification) => {
              const isExpanded =
                expandedNotificationId === notification.id
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    isExpanded
                      ? "bg-zinc-800/60 border-zinc-600/50"
                      : notification.read
                        ? "bg-zinc-800/20 border-zinc-800/30 hover:bg-zinc-800/30"
                        : "bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800/50"
                  )}
                  onClick={() => {
                    onToggleExpand(notification.id)
                    if (!notification.read) {
                      onNotificationRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <NotificationIcon type={notification.type} />
                    <div className="flex-1 min-w-0">
                      {isExpanded && notification.title && (
                        <p className="text-sm font-medium mb-1">
                          {notification.title}
                        </p>
                      )}
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          !isExpanded && "line-clamp-2"
                        )}
                      >
                        {notification.message}
                      </p>
                      {isExpanded && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                          {notification.leadId && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Linked Lead
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            {notification.type.replace("_", " ")}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-zinc-500 mt-1">
                        {timeAgo(new Date(notification.createdAt))}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
})

export { NotificationsPanel }
