"use client";

import React, { useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Clock,
  Globe,
  Bot,
  Target,
  Building2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { timeAgo, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

type FilterType = "all" | "unread" | "high_value" | "urgent";

const typeIconMap: Record<Notification["type"], { icon: typeof Bell; color: string; bg: string }> = {
  high_value: { icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  urgent: { icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10" },
  government: { icon: Building2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  enterprise: { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
  follow_up: { icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
  system: { icon: Bot, color: "text-purple-400", bg: "bg-purple-500/10" },
  agent: { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10" },
  new_lead: { icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  medium: { label: "Medium", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  low: { label: "Low", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

const typeBadgeConfig: Record<Notification["type"], string> = {
  high_value: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  urgent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  government: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  enterprise: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  follow_up: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  system: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  agent: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  new_lead: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

interface NotificationListProps {
  allNotifications: Notification[];
  filter: FilterType;
  onToggleRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearFilter: () => void;
  onRestoreAll: () => void;
}

const NotificationList = React.memo(function NotificationList({
  allNotifications,
  filter,
  onToggleRead,
  onDismiss,
  onClearFilter,
  onRestoreAll,
}: NotificationListProps) {
  const filtered = useMemo(() => {
    switch (filter) {
      case "unread":
        return allNotifications.filter((n) => !n.read);
      case "high_value":
        return allNotifications.filter((n) => n.priority === "high");
      case "urgent":
        return allNotifications.filter((n) => n.priority === "high" || n.type === "urgent");
      default:
        return allNotifications;
    }
  }, [allNotifications, filter]);

  return (
    <>
      {filter !== "all" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing:</span>
          <Badge variant="outline" className="text-[10px] font-medium border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            {filter === "unread" ? "Unread" : filter === "high_value" ? "High Value" : "Urgent"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilter}
            className="h-6 px-2 text-[10px] text-slate-500 hover:text-white hover:bg-slate-800 rounded-md"
          >
            Clear filter
          </Button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const typeMeta = typeIconMap[notif.type] || typeIconMap.agent;
            const priorityMeta = priorityConfig[notif.priority] || priorityConfig.low;
            const TypeIcon = typeMeta.icon;

            return (
              <Card
                key={notif.id}
                onClick={() => !notif.read && onToggleRead(notif.id)}
                className={cn(
                  "group border-slate-800/50 bg-[#12121a] hover:bg-[#16161f] transition-all duration-200 hover:border-slate-700/50 overflow-hidden cursor-pointer",
                  !notif.read && "border-l-2 border-l-cyan-500/60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", typeMeta.bg)}>
                      <TypeIcon className={cn("w-4 h-4", typeMeta.color)} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className={cn(
                            "text-sm font-medium leading-tight truncate",
                            !notif.read ? "text-white" : "text-slate-300"
                          )}>
                            {notif.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {notif.priority && (
                            <Badge variant="outline" className={cn("text-[10px] font-medium border hidden sm:inline-flex", priorityMeta.className)}>
                              {priorityMeta.label}
                            </Badge>
                          )}
                          <Badge variant="outline" className={cn("text-[10px] font-medium border hidden sm:inline-flex", typeBadgeConfig[notif.type])}>
                            {notif.type.replace("_", " ")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notif.id);
                            }}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-3 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(new Date(notif.createdAt))}
                          </span>
                          {!notif.read && (
                            <span className="flex items-center gap-1 text-cyan-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              Unread
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 sm:hidden">
                            {notif.priority && (
                              <Badge variant="outline" className={cn("text-[9px] font-medium border", priorityMeta.className)}>
                                {priorityMeta.label}
                              </Badge>
                            )}
                            <Badge variant="outline" className={cn("text-[9px] font-medium border", typeBadgeConfig[notif.type])}>
                              {notif.type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {notif.leadId && (
                            <Link
                              href={`/leads/${notif.leadId}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md"
                              >
                                <Target className="w-3 h-3 mr-1" />
                                View Lead
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleRead(notif.id);
                            }}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-300 hover:bg-slate-800 rounded-md"
                          >
                            {notif.read ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 bg-[#12121a] border-slate-800/50">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400">
              {filter === "unread" ? "No unread notifications" : allNotifications.length === 0 ? "No notifications" : "No notifications"}
            </h3>
            <p className="text-slate-500 text-sm max-w-sm">
              {allNotifications.length === 0
                ? "All notifications have been cleared. Click Restore to bring them back."
                : filter === "unread"
                  ? "You're all caught up! New notifications will appear here."
                  : "There are no notifications matching this filter."}
            </p>
            {allNotifications.length === 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRestoreAll}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Restore notifications
              </Button>
            ) : filter !== "all" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilter}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-2"
              >
                View all notifications
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}
    </>
  );
});

export { NotificationList, typeIconMap, priorityConfig, typeBadgeConfig };
export type { FilterType };
