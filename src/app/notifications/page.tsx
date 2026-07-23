"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Clock,
  Globe,
  Bot,
  Settings,
  Eye,
  EyeOff,
  Target,
  Building2,
  Mail,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { timeAgo, cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data";
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
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    highValue: notifications.filter((n) => n.priority === "high").length,
    urgent: notifications.filter((n) => n.priority === "high" || n.type === "urgent").length,
  }), [notifications]);

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "high_value":
        return notifications.filter((n) => n.priority === "high");
      case "urgent":
        return notifications.filter((n) => n.priority === "high" || n.type === "urgent");
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-slate-700/50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-cyan-400" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0a0a0f]">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Notification Center</h1>
                  <p className="text-sm text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="border-slate-700/50 bg-[#12121a] text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 h-9 rounded-lg text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700/50 bg-[#12121a] text-slate-300 hover:bg-slate-800 hover:text-white h-9 rounded-lg text-xs"
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Preferences
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total", value: stats.total, icon: Bell, color: "text-slate-400", bg: "from-slate-500/5 to-slate-800/5", filterType: "all" as FilterType },
                { label: "Unread", value: stats.unread, icon: Eye, color: "text-cyan-400", bg: "from-cyan-500/5 to-cyan-800/5", filterType: "unread" as FilterType },
                { label: "High Value", value: stats.highValue, icon: DollarSign, color: "text-emerald-400", bg: "from-emerald-500/5 to-emerald-800/5", filterType: "high_value" as FilterType },
                { label: "Urgent", value: stats.urgent, icon: AlertTriangle, color: "text-rose-400", bg: "from-rose-500/5 to-rose-800/5", filterType: "urgent" as FilterType },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  onClick={() => setFilter(stat.filterType)}
                  className={cn(
                    "border-0 bg-gradient-to-br cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                    stat.bg,
                    filter === stat.filterType
                      ? "ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/5"
                      : "border-slate-800/50 hover:border-slate-700/50"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</p>
                        <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                      </div>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notif) => {
                  const typeMeta = typeIconMap[notif.type];
                  const priorityMeta = priorityConfig[notif.priority] || priorityConfig.low;
                  const TypeIcon = typeMeta.icon;

                  return (
                    <Card
                      key={notif.id}
                      className={cn(
                        "group border-0 bg-[#12121a] hover:bg-[#16161f] transition-all duration-200 border-slate-800/50 hover:border-slate-700/50",
                        !notif.read && "border-l-2 border-l-cyan-500/60"
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", typeMeta.bg)}>
                            <TypeIcon className={cn("w-5 h-5", typeMeta.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className={cn(
                                  "text-sm font-medium leading-tight",
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
                                  <Badge variant="outline" className={cn("text-[10px] font-medium border", priorityMeta.className)}>
                                    {priorityMeta.label}
                                  </Badge>
                                )}
                                <Badge variant="outline" className={cn("text-[10px] font-medium border", typeBadgeConfig[notif.type])}>
                                  {notif.type.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
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
                              </div>
                              <div className="flex items-center gap-2">
                                {notif.leadId && (
                                  <Link href={`/leads/${notif.leadId}`}>
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
                                  onClick={() => toggleRead(notif.id)}
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
                    {filter === "unread" ? "No unread notifications" : "No notifications"}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    {filter === "unread"
                      ? "You're all caught up! New notifications will appear here."
                      : "There are no notifications matching this filter."}
                  </p>
                  {filter !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-2"
                    >
                      View all notifications
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
