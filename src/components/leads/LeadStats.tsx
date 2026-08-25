"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Target } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { statusConfig, statusSummaryCards } from "./leads-config";

interface LeadStatsProps {
  activeLeadCount: number;
  totalBudget: number;
  avgProbability: number;
  statusCounts: Record<string, number>;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

const LeadStats = memo(function LeadStats({
  activeLeadCount,
  totalBudget,
  avgProbability,
  statusCounts,
  statusFilter,
  setStatusFilter,
}: LeadStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Total Leads", value: activeLeadCount, icon: <Users className="w-5 h-5" />, color: "text-indigo-400", bg: "from-indigo-500/10 to-rose-600/5 border-indigo-500/20" },
          { label: "Total Pipeline", value: formatCurrency(totalBudget), icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20" },
          { label: "Avg. Win Probability", value: `${avgProbability}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-400", bg: "from-amber-500/10 to-amber-600/5 border-amber-500/20" },
          { label: "Conversion Rate", value: `${activeLeadCount ? Math.round(((statusCounts.won || 0) / activeLeadCount) * 100) : 0}%`, icon: <Target className="w-5 h-5" />, color: "text-rose-400", bg: "from-rose-500/10 to-rose-600/5 border-rose-500/20" },
        ].map((stat, i) => (
          <Card key={i} className={cn("bg-zinc-900/80 bg-gradient-to-br border animate-in fade-in slide-in-from-bottom-4 duration-500", stat.bg)} style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4 flex items-center gap-4 overflow-hidden">
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br border shrink-0", stat.bg)}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-0.5 truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
        {statusSummaryCards.map((card, i) => {
          const cfg = statusConfig[card.key];
          return (
            <button
              key={card.key}
              onClick={() => setStatusFilter(statusFilter === card.key ? "all" : card.key)}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-500",
                statusFilter === card.key
                  ? "border-white/20 bg-white/[0.06] scale-[1.03]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              )}
              style={{ animationDelay: `${400 + i * 60}ms` }}
            >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br pointer-events-none", card.color, "opacity-10")} />
              <div className="relative flex items-center gap-2 mb-2">
                <span className={cfg.color}>{cfg.icon}</span>
                <span className={cn("text-xs font-semibold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
              </div>
              <p className="relative text-2xl font-bold text-white">{statusCounts[card.key]}</p>
            </button>
          );
        })}
      </div>
    </>
  );
});

export default LeadStats;
