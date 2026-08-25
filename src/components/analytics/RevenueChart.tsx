"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { DollarSign, TrendingUp, RefreshCw } from "lucide-react";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  proposals: number;
}

interface IndustryTrend {
  industry: string;
  growth: number;
  opportunities: number;
}

interface RevenueChartProps {
  monthlyRevenue: MonthlyRevenue[];
  maxMonthlyRevenue: number;
  industryTrends: IndustryTrend[];
  isRefreshing: boolean;
}

export const RevenueChart = memo(function RevenueChart({
  monthlyRevenue,
  maxMonthlyRevenue,
  industryTrends,
  isRefreshing,
}: RevenueChartProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/80 border-zinc-800/80 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="truncate">Monthly Revenue</span>
          </CardTitle>
          <CardDescription className="truncate">Revenue breakdown over the selected period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 overflow-hidden">
          {isRefreshing ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          ) : (
            monthlyRevenue.map((month, i) => (
              <div
                key={month.month}
                className="flex items-center gap-4 group"
              >
                <span className="text-sm text-zinc-500 w-10 shrink-0 font-mono">{month.month}</span>
                <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative min-w-0">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-emerald-600/80 to-emerald-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:from-emerald-500/80 group-hover:to-emerald-300/80 pointer-events-none"
                    style={{ width: `${(month.revenue / maxMonthlyRevenue) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white drop-shadow-lg">
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-zinc-600 shrink-0 w-16 text-right">{month.proposals} props</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/80 border-zinc-800/80 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <TrendingUp className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="truncate">Industry Trends</span>
          </CardTitle>
          <CardDescription className="truncate">Growth rates across key industry sectors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-hidden">
          {industryTrends.map((trend) => (
            <div key={trend.industry}>
              <div className="flex items-center justify-between mb-2 min-w-0">
                <span className="text-sm text-zinc-300 truncate min-w-0">{trend.industry}</span>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs text-zinc-500">{trend.opportunities} opps</span>
                  <span className={cn(
                    "text-sm font-semibold",
                    trend.growth >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {trend.growth >= 0 ? "+" : ""}{trend.growth}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600/80 to-rose-400/80 transition-all duration-700 ease-out pointer-events-none"
                  style={{ width: `${Math.min(Math.abs(trend.growth) * 3, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});
