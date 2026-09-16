"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiItem {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon: LucideIcon;
  color: string;
  glow: string;
}

interface KpiCardsProps {
  kpis: KpiItem[];
}

export const KpiCards = memo(function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.label}
          className="bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 overflow-hidden relative"
        >
          <div className={cn("absolute inset-0 opacity-30 pointer-events-none", kpi.glow)} />
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg shrink-0", kpi.glow)}>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-medium shrink-0",
                kpi.up ? "text-emerald-400" : "text-rose-400"
              )}>
                <ArrowUpRight className={cn("w-3 h-3", !kpi.up && "rotate-90")} />
                {kpi.trend}
              </span>
            </div>
            <p className="text-xl font-bold text-white truncate">{kpi.value}</p>
            <p className="text-xs text-zinc-500 mt-1 truncate">{kpi.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
