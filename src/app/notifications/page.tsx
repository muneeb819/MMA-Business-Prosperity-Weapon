"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Settings,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { NotificationStats } from "@/components/notifications/NotificationStats";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationPreferences, PreferenceKey } from "@/components/notifications/NotificationPreferences";

type FilterType = "all" | "unread" | "high_value" | "urgent";

export default function NotificationsPage() {
  useEffect(() => { document.title = "Notifications | MBPW"; }, []);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showPreferences, setShowPreferences] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [prefs, setPrefs] = useState<Record<PreferenceKey, boolean>>({
    highValue: true,
    urgentAlerts: true,
    governmentContracts: true,
    systemUpdates: false,
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchNotifications() {
      setLoading(true);
      try {
        const data = await api.notifications.list();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setNotifications(data.map((n: any) => ({
            ...n,
            leadId: n.leadId || n.lead_id || undefined,
            createdAt: n.createdAt || n.created_at || new Date().toISOString(),
          })));
        }
      } catch {
        // API unavailable — keep mockNotifications
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNotifications();
    return () => { cancelled = true; };
  }, []);

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

  const togglePref = useCallback((key: PreferenceKey) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    const label = key === "highValue" ? "High Value Leads" : key === "urgentAlerts" ? "Urgent Alerts" : key === "governmentContracts" ? "Government Contracts" : "System Updates";
    showToast(`${label} ${prefs[key] ? "disabled" : "enabled"}`);
  }, [prefs, showToast]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    highValue: notifications.filter((n) => n.priority === "high").length,
    urgent: notifications.filter((n) => n.priority === "high" || n.type === "urgent").length,
  }), [notifications]);

  const markAllRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
    } catch {
      // API unavailable — continue with local state
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  }, [showToast]);

  const toggleRead = useCallback(async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif && !notif.read) {
      try {
        await api.notifications.markRead(id);
      } catch {
        // API unavailable — continue with local state
      }
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }, [notifications]);

  const dismissNotification = useCallback(async (id: string) => {
    try {
      await api.notifications.dismiss(id);
    } catch {
      // API unavailable — continue with local state
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await api.notifications.clearAll();
    } catch {
      // API unavailable — continue with local state
    }
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
                    {loading ? "Loading..." : unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
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

            {showPreferences && (
              <NotificationPreferences
                prefs={prefs}
                onTogglePref={togglePref}
                onClose={() => setShowPreferences(false)}
              />
            )}

            <NotificationStats
              stats={stats}
              filter={filter}
              onFilterChange={setFilter}
            />

            <NotificationList
              allNotifications={notifications}
              filter={filter}
              onToggleRead={toggleRead}
              onDismiss={dismissNotification}
              onClearFilter={() => setFilter("all")}
              onRestoreAll={restoreAll}
            />

          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-5 py-3 bg-[#1a1a24] border border-cyan-500/30 rounded-xl shadow-xl shadow-cyan-500/10 animate-in slide-in-from-bottom-4 fade-in duration-300">
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
