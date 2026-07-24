"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  X,
  Trash2,
  RotateCcw,
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
  const [showPreferences, setShowPreferences] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prefs, setPrefs] = useState({
    highValue: true,
    urgentAlerts: true,
    governmentContracts: true,
    systemUpdates: false,
  });

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const togglePref = useCallback((key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast(`${key === "highValue" ? "High Value Leads" : key === "urgentAlerts" ? "Urgent Alerts" : key === "governmentContracts" ? "Government Contracts" : "System Updates"} ${prefs[key] ? "disabled" : "enabled"}`);
  }, [prefs, showToast]);

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

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  }, [showToast]);

  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    showToast("All notifications cleared");
  }, [showToast]);

  const restoreAll = useCallback(() => {
    setNotifications(mockNotifications);
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-slate-700/50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-cyan-400" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0a0a0f]">
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
              <div className="flex items-center gap-2 flex-wrap">
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
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="border-slate-700/50 bg-[#12121a] text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40 h-9 rounded-lg text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restoreAll}
                  className="border-slate-700/50 bg-[#12121a] text-slate-300 hover:bg-slate-800 hover:text-white h-9 rounded-lg text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Restore
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreferences((prev) => !prev)}
                  className={cn(
                    "h-9 rounded-lg text-xs",
                    showPreferences
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700/50 bg-[#12121a] text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Preferences
                </Button>
              </div>
            </div>

            {/* Preferences Panel */}
            {showPreferences && (
              <Card className="border-0 bg-[#12121a] border-slate-800/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreferences(false)}
                      className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { key: "highValue" as const, label: "High Value Leads", enabled: prefs.highValue },
                      { key: "urgentAlerts" as const, label: "Urgent Alerts", enabled: prefs.urgentAlerts },
                      { key: "governmentContracts" as const, label: "Government Contracts", enabled: prefs.governmentContracts },
                      { key: "systemUpdates" as const, label: "System Updates", enabled: prefs.systemUpdates },
                    ].map((pref) => (
                      <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <span className="text-xs text-slate-400">{pref.label}</span>
                        <button
                          onClick={() => togglePref(pref.key)}
                          className={cn(
                            "w-9 h-5 rounded-full flex items-center cursor-pointer transition-colors duration-200",
                            pref.enabled ? "bg-cyan-500/30 justify-end" : "bg-slate-700/50 justify-start"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full mx-0.5 transition-colors duration-200",
                            pref.enabled ? "bg-cyan-400" : "bg-slate-500"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    "border-slate-800/50 bg-gradient-to-br cursor-pointer transition-all duration-200 hover:scale-[1.02] overflow-hidden",
                    stat.bg,
                    filter === stat.filterType
                      ? "ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-500/5"
                      : "hover:border-slate-700/50"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium truncate">{stat.label}</p>
                        <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                      </div>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active Filter Indicator */}
            {filter !== "all" && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Showing:</span>
                <Badge variant="outline" className="text-[10px] font-medium border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {filter === "unread" ? "Unread" : filter === "high_value" ? "High Value" : "Urgent"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="h-6 px-2 text-[10px] text-slate-500 hover:text-white hover:bg-slate-800 rounded-md"
                >
                  Clear filter
                </Button>
              </div>
            )}

            {/* Notifications List */}
            {filteredNotifications.length > 0 ? (
              <div className="space-y-2">
                {filteredNotifications.map((notif) => {
                  const typeMeta = typeIconMap[notif.type];
                  const priorityMeta = priorityConfig[notif.priority] || priorityConfig.low;
                  const TypeIcon = typeMeta.icon;

                  return (
                    <Card
                      key={notif.id}
                      onClick={() => !notif.read && toggleRead(notif.id)}
                      className={cn(
                        "group border-slate-800/50 bg-[#12121a] hover:bg-[#16161f] transition-all duration-200 hover:border-slate-700/50 overflow-hidden cursor-pointer",
                        !notif.read && "border-l-2 border-l-cyan-500/60"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Type Icon */}
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", typeMeta.bg)}>
                            <TypeIcon className={cn("w-4 h-4", typeMeta.color)} />
                          </div>

                          {/* Content */}
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
                                    dismissNotification(notif.id);
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
                                {/* Mobile badges */}
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
                                    toggleRead(notif.id);
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
                    {filter === "unread" ? "No unread notifications" : notifications.length === 0 ? "No notifications" : "No notifications"}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    {notifications.length === 0
                      ? "All notifications have been cleared. Click Restore to bring them back."
                      : filter === "unread"
                        ? "You're all caught up! New notifications will appear here."
                        : "There are no notifications matching this filter."}
                  </p>
                  {notifications.length === 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={restoreAll}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Restore notifications
                    </Button>
                  ) : filter !== "all" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 mt-2"
                    >
                      View all notifications
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-5 py-3 bg-[#1a1a24] border border-cyan-500/30 rounded-xl shadow-xl shadow-cyan-500/10 backdrop-blur-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-sm text-slate-200 min-w-0">{toast}</span>
            <button
              onClick={() => {
                setToast(null);
                if (toastTimer.current) clearTimeout(toastTimer.current);
              }}
              className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
