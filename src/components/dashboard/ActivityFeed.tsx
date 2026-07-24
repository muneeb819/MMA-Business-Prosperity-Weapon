"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Users, FileText, Cpu, Bot, RefreshCw } from "lucide-react"
import { timeAgo, cn } from "@/lib/utils"
import type { ActivityLog } from "@/lib/types"

interface ActivityFeedProps {
  activities: ActivityLog[]
  isRefreshing: boolean
  onRefresh: () => void
  onActivityClick: (details: string) => void
}

function getActivityIcon(action: string) {
  if (action.includes("lead"))
    return <Users className="w-3.5 h-3.5 text-cyan-400" />
  if (action.includes("proposal"))
    return <FileText className="w-3.5 h-3.5 text-violet-400" />
  if (action.includes("system"))
    return <Cpu className="w-3.5 h-3.5 text-amber-400" />
  if (action.includes("agent"))
    return <Bot className="w-3.5 h-3.5 text-emerald-400" />
  return <Activity className="w-3.5 h-3.5 text-zinc-400" />
}

const ActivityFeed = React.memo(function ActivityFeed({
  activities,
  isRefreshing,
  onRefresh,
  onActivityClick,
}: ActivityFeedProps) {
  return (
    <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Activity Monitor</CardTitle>
              <CardDescription>Real-time system activity</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-zinc-400 hover:text-white shrink-0",
              isRefreshing && "animate-spin"
            )}
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                onClick={() => onActivityClick(activity.details)}
              >
                <div className="mt-0.5 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
                    {getActivityIcon(activity.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed line-clamp-2">
                    {activity.details}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {timeAgo(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
})

export { ActivityFeed }
