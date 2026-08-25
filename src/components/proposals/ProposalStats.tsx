"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import {
  FileText,
  Edit3,
  Send,
  CheckCircle2,
  Target,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface ProposalStatsProps {
  stats: {
    drafts: number;
    submitted: number;
    accepted: number;
    rejected: number;
    revision: number;
    avgWin: number;
    total: number;
  };
  totalBudget: number;
}

function ProposalStatsInner({ stats, totalBudget }: ProposalStatsProps) {
  const statCards = [
    { label: "Total Proposals", value: stats.total, icon: <FileText className="w-5 h-5" />, color: "text-indigo-400", bg: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20" },
    { label: "Drafts", value: stats.drafts, icon: <Edit3 className="w-5 h-5" />, color: "text-zinc-400", bg: "from-zinc-500/10 to-zinc-600/5 border-zinc-500/20" },
    { label: "Submitted", value: stats.submitted, icon: <Send className="w-5 h-5" />, color: "text-indigo-400", bg: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20" },
    { label: "Accepted", value: stats.accepted, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20" },
  ];

  const conversion = stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((stat, i) => (
          <Card key={i} className={cn("bg-gradient-to-br border bg-zinc-900/80 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden", stat.bg)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br border shrink-0", stat.bg)}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <Card className="bg-gradient-to-br from-rose-500/[0.06] to-rose-600/[0.02] border-rose-500/15 bg-zinc-900/80 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Target className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">Avg. Win Rate</span>
              </div>
              <span className="text-lg font-bold text-rose-400 shrink-0">{stats.avgWin}%</span>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000" style={{ width: `${stats.avgWin}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/[0.06] to-green-600/[0.02] border-emerald-500/15 bg-zinc-900/80 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">Conversion</span>
              </div>
              <span className="text-lg font-bold text-emerald-400 shrink-0">{conversion}%</span>
            </div>
            <p className="text-[11px] text-zinc-600 truncate">{stats.accepted} of {stats.total} proposals accepted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/[0.06] to-orange-600/[0.02] border-amber-500/15 bg-zinc-900/80 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">Pipeline Value</span>
              </div>
              <span className="text-lg font-bold text-amber-400 shrink-0">{formatCurrency(totalBudget)}</span>
            </div>
            <p className="text-[11px] text-zinc-600 truncate">Across all active proposals</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export const ProposalStats = React.memo(ProposalStatsInner);
