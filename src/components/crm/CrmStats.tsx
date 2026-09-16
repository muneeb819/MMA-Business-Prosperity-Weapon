"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  glow: string;
}

interface CrmStatsProps {
  stats: StatItem[];
}

export const CrmStats = memo(function CrmStats({ stats }: CrmStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className={cn("p-2.5 rounded-lg", s.glow)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
