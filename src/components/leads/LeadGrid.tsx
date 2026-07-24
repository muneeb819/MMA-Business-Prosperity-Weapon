"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { statusConfig, urgencyConfig } from "./leads-config";
import {
  Clock,
  Users,
  Globe,
  Briefcase,
  Cpu,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

interface LeadGridProps {
  visibleLeads: Lead[];
  viewMode: "grid" | "list";
  onSelectLead: (lead: Lead) => void;
  hasMore: boolean;
  filteredLeadsLength: number;
  showCount: number;
  onShowMore: () => void;
  clearFilters: () => void;
}

const LeadGrid = memo(function LeadGrid({
  visibleLeads,
  viewMode,
  onSelectLead,
  hasMore,
  filteredLeadsLength,
  showCount,
  onShowMore,
  clearFilters,
}: LeadGridProps) {
  return (
    <>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleLeads.map((lead, i) => {
            const sCfg = statusConfig[lead.status] || statusConfig.new;
            const uCfg = urgencyConfig[lead.urgency] || urgencyConfig.low;
            const prob = lead.successProbability || 0;

            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-zinc-900/80 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 fill-mode-both overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 shrink-0", sCfg.bg, sCfg.color)}>
                        {sCfg.icon}
                        <span className="ml-1">{sCfg.label}</span>
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 shrink-0", uCfg.color)}>
                        {uCfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="whitespace-nowrap">{timeAgo(new Date(lead.foundAt))}</span>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                    {lead.title}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{lead.company}</span>
                    <span className="text-zinc-700 shrink-0">·</span>
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{lead.clientName}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs min-w-0">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{lead.country || "Global"}</span>
                    </div>
                    <div className="text-emerald-400 text-xs sm:text-sm font-semibold whitespace-nowrap">
                      {formatCurrency(lead.budget.min)} – {formatCurrency(lead.budget.max)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Success Probability</span>
                      <span className={cn("text-xs font-bold", prob >= 70 ? "text-emerald-400" : prob >= 40 ? "text-amber-400" : "text-red-400")}>{prob}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", prob >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400" : prob >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400")}
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(lead.technologies || []).slice(0, 4).map((tech) => (
                      <span key={tech} className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-0.5">
                        <Cpu className="w-2.5 h-2.5" />
                        {tech}
                      </span>
                    ))}
                    {(lead.technologies || []).length > 4 && (
                      <span className="text-[10px] text-zinc-600">+{lead.technologies.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleLeads.map((lead, i) => {
            const sCfg = statusConfig[lead.status] || statusConfig.new;
            const uCfg = urgencyConfig[lead.urgency] || urgencyConfig.low;
            const prob = lead.successProbability || 0;

            return (
              <div
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="group cursor-pointer rounded-xl border border-white/[0.06] bg-zinc-900/80 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both overflow-hidden"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5", sCfg.bg, sCfg.color)}>
                      {sCfg.icon}
                      <span className="ml-1 hidden sm:inline">{sCfg.label}</span>
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 hidden sm:inline-flex", uCfg.color)}>
                      {uCfg.label}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-blue-300 transition-colors truncate">
                      {lead.title}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                      <span className="truncate">{lead.company}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="truncate">{lead.clientName}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="truncate">{lead.country || "Global"}</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-600 uppercase">Budget</p>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-400 whitespace-nowrap">{formatCurrency(lead.budget.max)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-600 uppercase">Probability</p>
                      <p className={cn("text-xs font-bold", prob >= 70 ? "text-emerald-400" : prob >= 40 ? "text-amber-400" : "text-red-400")}>{prob}%</p>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", prob >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400" : prob >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400")}
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] shrink-0">
                    <Clock className="w-3 h-3" />
                    <span className="whitespace-nowrap">{timeAgo(new Date(lead.foundAt))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onShowMore}
            className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Load More ({filteredLeadsLength - showCount} remaining)
          </Button>
        </div>
      )}

      {filteredLeadsLength === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-500 font-medium">No leads found</p>
          <p className="text-zinc-700 text-sm mt-1">Try adjusting your search or filters</p>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4 text-zinc-500 hover:text-white text-xs">
            <X className="w-3.5 h-3.5 mr-1" />
            Clear all filters
          </Button>
        </div>
      )}
    </>
  );
});

export default LeadGrid;
