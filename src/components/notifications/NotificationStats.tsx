"use client";

import React from "react";
import {
  Bell,
  DollarSign,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FilterType = "all" | "unread" | "high_value" | "urgent";

interface StatItem {
  label: string;
  value: number;
  icon: typeof Bell;
  color: string;
  bg: string;
  filterType: FilterType;
}

interface NotificationStatsProps {
  stats: {
    total: number;
    unread: number;
    highValue: number;
    urgent: number;
  };
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
}

const NotificationStats = React.memo(function NotificationStats({
  stats,
  filter,
  onFilterChange,
}: NotificationStatsProps) {
  const statItems: StatItem[] = [
    { label: "Total", value: stats.total, icon: Bell, color: "text-slate-400", bg: "from-slate-500/5 to-slate-800/5", filterType: "all" },
    { label: "Unread", value: stats.unread, icon: Eye, color: "text-cyan-400", bg: "from-cyan-500/5 to-cyan-800/5", filterType: "unread" },
    { label: "High Value", value: stats.highValue, icon: DollarSign, color: "text-emerald-400", bg: "from-emerald-500/5 to-emerald-800/5", filterType: "high_value" },
    { label: "Urgent", value: stats.urgent, icon: AlertTriangle, color: "text-rose-400", bg: "from-rose-500/5 to-rose-800/5", filterType: "urgent" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((stat) => (
        <Card
          key={stat.label}
          onClick={() => onFilterChange(stat.filterType)}
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
  );
});

export { NotificationStats };
