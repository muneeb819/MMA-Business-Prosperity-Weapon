"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Globe, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

type SortField = "count" | "revenue" | "name";
type SortDir = "asc" | "desc";

interface CountryItem {
  country: string;
  count: number;
  revenue: number;
}

interface CountryBreakdownProps {
  countries: CountryItem[];
  totalCount: number;
  sort: { field: SortField; dir: SortDir };
  onToggleSort: (field: SortField) => void;
  showAll: boolean;
  onToggleShowAll: () => void;
}

function SortButton({ label, field, current, onToggle }: { label: string; field: SortField; current: { field: SortField; dir: SortDir }; onToggle: () => void }) {
  const active = current.field === field;
  return (
    <button
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md transition-colors shrink-0 min-h-9",
        active ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
      )}
    >
      {label}
      <ArrowUpDown className={cn("w-3 h-3", active && "text-violet-400")} />
    </button>
  );
}

export const CountryBreakdown = memo(function CountryBreakdown({
  countries,
  totalCount,
  sort,
  onToggleSort,
  showAll,
  onToggleShowAll,
}: CountryBreakdownProps) {
  const displayed = showAll ? countries : countries.slice(0, 3);
  const maxCount = Math.max(...countries.map((c) => c.count), 1);

  return (
    <Card className="bg-zinc-900/80 border-zinc-800/80 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between min-w-0">
          <CardTitle className="text-lg flex items-center gap-2 min-w-0">
            <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="truncate">Leads by Country</span>
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <SortButton label="Count" field="count" current={sort} onToggle={() => onToggleSort("count")} />
            <SortButton label="Revenue" field="revenue" current={sort} onToggle={() => onToggleSort("revenue")} />
            <SortButton label="Name" field="name" current={sort} onToggle={() => onToggleSort("name")} />
          </div>
        </div>
        <CardDescription className="truncate">Geographic distribution of your leads</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        {displayed.map((country, i) => (
          <div
            key={country.country}
            className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors overflow-hidden"
          >
            <span className="text-lg font-bold text-zinc-600 w-6 text-right shrink-0">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 min-w-0">
                <span className="text-sm font-medium text-white truncate min-w-0">{country.country}</span>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs text-zinc-500">{country.count} leads</span>
                  <span className="text-xs font-semibold text-emerald-400">{formatCurrency(country.revenue)}</span>
                </div>
              </div>
              <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600/80 to-cyan-400/80 transition-all duration-700 ease-out pointer-events-none"
                  style={{ width: `${(country.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
        {totalCount > 3 && (
          <button
            onClick={onToggleShowAll}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>See All ({totalCount}) <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
});
