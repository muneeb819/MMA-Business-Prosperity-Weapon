"use client";

import React from "react";
import {
  Globe,
  DollarSign,
  Filter,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const countries = [
  "All Countries",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "Australia",
  "Singapore",
  "Netherlands",
  "India",
  "Brazil",
];

const technologyColors = [
  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
];

interface SearchFiltersProps {
  countryFilter: string;
  onCountryChange: (v: string) => void;
  budgetMin: string;
  onBudgetMinChange: (v: string) => void;
  budgetMax: string;
  onBudgetMaxChange: (v: string) => void;
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  totalActiveFilters: number;
  availableTechs?: string[];
}

const SearchFilters = React.memo(function SearchFilters({
  countryFilter,
  onCountryChange,
  budgetMin,
  onBudgetMinChange,
  budgetMax,
  onBudgetMaxChange,
  selectedTechs,
  onToggleTech,
  onApplyFilters,
  onClearFilters,
  totalActiveFilters,
  availableTechs = [],
}: SearchFiltersProps) {
  return (
    <>
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#12121a] to-[#0d0d14] shadow-2xl shadow-indigo-500/5">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5" />
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
        <CardContent className="relative p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm shrink-0">
              <Filter className="w-4 h-4 shrink-0" />
              <span>Filters</span>
              {totalActiveFilters > 0 && (
                <Badge variant="outline" className="shrink-0 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[10px] px-1.5 py-0">
                  {totalActiveFilters}
                </Badge>
              )}
            </div>
            <Select value={countryFilter} onValueChange={onCountryChange}>
              <SelectTrigger className="w-[180px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg focus:ring-indigo-500/30 focus:border-indigo-500/40">
                <Globe className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a24] border-slate-700/50 text-white z-50">
                {countries.map((c) => (
                  <SelectItem key={c} value={c} className="text-sm focus:bg-indigo-500/10 focus:text-indigo-300">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 shrink-0" />
                <Input
                  type="number"
                  placeholder="Min"
                  value={budgetMin}
                  onChange={(e) => onBudgetMinChange(e.target.value)}
                  className="w-[110px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg pl-7 focus:ring-indigo-500/30 focus:border-indigo-500/40"
                />
              </div>
              <span className="text-slate-600 text-sm">—</span>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 shrink-0" />
                <Input
                  type="number"
                  placeholder="Max"
                  value={budgetMax}
                  onChange={(e) => onBudgetMaxChange(e.target.value)}
                  className="w-[110px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg pl-7 focus:ring-indigo-500/30 focus:border-indigo-500/40"
                />
              </div>
            </div>

            <Button
              onClick={onApplyFilters}
              variant="outline"
              className="h-9 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-sm rounded-lg"
            >
              Apply Filters
            </Button>
            <Button
              onClick={onClearFilters}
              variant="ghost"
              className="h-9 text-slate-500 hover:text-slate-300 text-sm rounded-lg"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-[#12121a] overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-slate-500 shrink-0">Technologies:</span>
            <div className="flex flex-wrap gap-2 min-w-0">
              {availableTechs.map((tech, ti) => (
                <button
                  key={tech}
                  onClick={() => onToggleTech(tech)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200 shrink-0",
                    selectedTechs.includes(tech)
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                      : technologyColors[ti % technologyColors.length] +
                          " hover:brightness-125"
                  )}
                >
                  {selectedTechs.includes(tech) && (
                    <Check className="w-3 h-3 inline mr-1 shrink-0" />
                  )}
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
});

export { SearchFilters, countries, technologyColors };
