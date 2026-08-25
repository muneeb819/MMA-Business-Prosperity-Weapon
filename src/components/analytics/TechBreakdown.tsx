"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Layers, Zap, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

type SortField = "count" | "revenue" | "name";
type SortDir = "asc" | "desc";

interface TechItem {
  tech: string;
  count: number;
}

interface PlatformItem {
  platform: string;
  leads: number;
}

interface TechBreakdownProps {
  techItems: TechItem[];
  platformItems: PlatformItem[];
  techSort: { field: SortField; dir: SortDir };
  platformSort: { field: SortField; dir: SortDir };
  onToggleTechSort: (field: SortField) => void;
  onTogglePlatformSort: (field: SortField) => void;
  showAllTech: boolean;
  showAllPlatforms: boolean;
  onToggleShowAllTech: () => void;
  onToggleShowAllPlatforms: () => void;
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
      <ArrowUpDown className={cn("w-3 h-3", active && "text-rose-400")} />
    </button>
  );
}

export const TechBreakdown = memo(function TechBreakdown({
  techItems,
  platformItems,
  techSort,
  platformSort,
  onToggleTechSort,
  onTogglePlatformSort,
  showAllTech,
  showAllPlatforms,
  onToggleShowAllTech,
  onToggleShowAllPlatforms,
}: TechBreakdownProps) {
  const displayedTech = showAllTech ? techItems : techItems.slice(0, 3);
  const displayedPlatforms = showAllPlatforms ? platformItems : platformItems.slice(0, 4);
  const maxTechCount = Math.max(...techItems.map((t) => t.count), 1);
  const maxPlatformLeads = Math.max(...platformItems.map((p) => p.leads), 1);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/80 border-zinc-800/80 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 min-w-0">
              <Layers className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="truncate">Leads by Technology</span>
            </CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              <SortButton label="Count" field="count" current={techSort} onToggle={() => onToggleTechSort("count")} />
              <SortButton label="Name" field="name" current={techSort} onToggle={() => onToggleTechSort("name")} />
            </div>
          </div>
          <CardDescription className="truncate">Technology stack preferences across your pipeline</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedTech.map((tech, i) => (
              <div
                key={tech.tech}
                className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-semibold text-white truncate min-w-0">{tech.tech}</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{tech.count}</p>
                <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600/80 to-amber-400/80 transition-all duration-700 ease-out pointer-events-none"
                    style={{ width: `${(tech.count / maxTechCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {techItems.length > 3 && (
            <button
              onClick={onToggleShowAllTech}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-zinc-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-zinc-800/40 mt-3"
            >
              {showAllTech ? (
                <>Show Less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>See All ({techItems.length}) <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/80 border-zinc-800/80 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 min-w-0">
              <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="truncate">Leads by Platform</span>
            </CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              <SortButton label="Count" field="count" current={platformSort} onToggle={() => onTogglePlatformSort("count")} />
              <SortButton label="Name" field="name" current={platformSort} onToggle={() => onTogglePlatformSort("name")} />
            </div>
          </div>
          <CardDescription className="truncate">Platform distribution across your lead sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-hidden">
          {displayedPlatforms.map((platform) => (
            <div
              key={platform.platform}
              className="flex items-center gap-4 overflow-hidden"
            >
              <span className="text-sm font-medium text-zinc-300 w-28 shrink-0 truncate">{platform.platform}</span>
              <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative min-w-0">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-indigo-600/80 to-rose-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3 pointer-events-none"
                  style={{ width: `${(platform.leads / maxPlatformLeads) * 100}%` }}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-lg">{platform.leads}</span>
                </div>
              </div>
            </div>
          ))}
          {platformItems.length > 4 && (
            <button
              onClick={onToggleShowAllPlatforms}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-zinc-800/40"
            >
              {showAllPlatforms ? (
                <>Show Less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>See All ({platformItems.length}) <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
