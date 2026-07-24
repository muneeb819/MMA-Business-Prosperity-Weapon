"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertTriangle, ArrowUpDown, LayoutGrid, List, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusConfig, urgencyConfig, type SortKey } from "./leads-config";

interface LeadFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  urgencyFilter: string;
  setUrgencyFilter: (value: string) => void;
  sortBy: SortKey;
  setSortBy: (value: SortKey) => void;
  viewMode: "grid" | "list";
  setViewMode: (value: "grid" | "list") => void;
  filteredLeadsLength: number;
  showCount: number;
  clearFilters: () => void;
  handleExport: () => void;
}

const LeadFilters = memo(function LeadFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  urgencyFilter,
  setUrgencyFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  filteredLeadsLength,
  showCount,
  clearFilters,
  handleExport,
}: LeadFiltersProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search leads by title, client, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-white/[0.03] border-white/[0.08] text-white h-11">
            <Filter className="w-4 h-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#12131C] border-white/10">
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-white/[0.03] border-white/[0.08] text-white h-11">
            <AlertTriangle className="w-4 h-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent className="bg-[#12131C] border-white/10">
            <SelectItem value="all">All Urgencies</SelectItem>
            {Object.entries(urgencyConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-48 bg-white/[0.03] border-white/[0.08] text-white h-11">
            <ArrowUpDown className="w-4 h-4 mr-2 text-zinc-500" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#12131C] border-white/10">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="budget-high">Budget: High to Low</SelectItem>
            <SelectItem value="budget-low">Budget: Low to High</SelectItem>
            <SelectItem value="probability">Probability: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4 flex-wrap gap-3">
        <p className="text-sm text-zinc-500">
          Showing <span className="text-white font-semibold">{Math.min(showCount, filteredLeadsLength)}</span> of{" "}
          <span className="text-white font-semibold">{filteredLeadsLength}</span> leads
        </p>
        <div className="flex items-center gap-2">
          {(searchQuery || statusFilter !== "all" || urgencyFilter !== "all" || sortBy !== "newest") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-white text-xs">
              <X className="w-3.5 h-3.5 mr-1" />
              Clear filters
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleExport} className="text-zinc-500 hover:text-white text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            Export
          </Button>
          <div className="flex items-center border border-white/[0.08] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-9 w-9 flex items-center justify-center transition-colors",
                viewMode === "grid" ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "h-9 w-9 flex items-center justify-center transition-colors",
                viewMode === "list" ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export default LeadFilters;
