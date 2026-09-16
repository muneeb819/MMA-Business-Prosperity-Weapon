"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SortOption } from "./types";
import {
  Sparkles,
  ArrowUpRight,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface ProposalFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusFilters: Array<{ key: string; label: string; count: number }>;
  onOpenGenerate: () => void;
}

function ProposalFiltersInner({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  statusFilters,
  onOpenGenerate,
}: ProposalFiltersProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          onClick={onOpenGenerate}
          className="bg-gradient-to-r from-indigo-600 via-rose-500 to-rose-600 hover:from-indigo-500 hover:via-rose-400 hover:to-rose-500 text-white font-semibold h-11 px-6 shadow-lg shadow-indigo-500/25 shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Generate Proposal
          <ArrowUpRight className="w-4 h-4 ml-2 opacity-60" />
        </Button>

        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search proposals..."
              className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 pl-9 h-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white h-10 w-full sm:w-[160px] text-sm">
              <ArrowUpDown className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#12131C] border-white/10">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="budget-high">Budget: High to Low</SelectItem>
              <SelectItem value="budget-low">Budget: Low to High</SelectItem>
              <SelectItem value="win-high">Win Rate: High to Low</SelectItem>
              <SelectItem value="win-low">Win Rate: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "px-3 h-9 rounded-lg text-xs font-medium transition-all duration-200 border inline-flex items-center",
              statusFilter === f.key
                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            )}
          >
            {f.label}
            <span className={cn("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full", statusFilter === f.key ? "bg-indigo-500/20 text-indigo-300" : "bg-white/[0.05] text-zinc-600")}>
              {f.count}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

export const ProposalFilters = React.memo(ProposalFiltersInner);
