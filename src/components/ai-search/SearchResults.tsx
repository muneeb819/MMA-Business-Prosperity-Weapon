"use client";

import React from "react";
import {
  Search,
  Brain,
  Building2,
  Globe,
  DollarSign,
  Target,
  ArrowUpDown,
  ArrowRight,
  Save,
  Download,
  Eye,
  Bookmark,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { suggestedSearches } from "./SearchHero";
import { technologyColors } from "./SearchFilters";

interface SearchResultsProps {
  results: Lead[];
  isSearching: boolean;
  hasSearched: boolean;
  sortBy: string;
  onSortChange: (v: string) => void;
  onSaveSearch: () => void;
  onExport: () => void;
  onSuggestedClick: (s: string) => void;
  showToast: (msg: string) => void;
}

const SearchResults = React.memo(function SearchResults({
  results,
  isSearching,
  hasSearched,
  sortBy,
  onSortChange,
  onSaveSearch,
  onExport,
  onSuggestedClick,
  showToast,
}: SearchResultsProps) {
  return (
    <div className="space-y-4">
      {isSearching && (
        <Card className="border-0 bg-[#12121a] overflow-hidden">
          <CardContent className="p-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse pointer-events-none" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-rose-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Brain className="w-10 h-10 text-indigo-400 animate-pulse shrink-0" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-white">AI is analyzing your query</h3>
              <p className="text-slate-400 text-sm">Matching against millions of prospects and signals...</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm ml-1">Processing</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!isSearching && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-lg font-semibold text-white shrink-0">Search Results</h2>
              <Badge variant="outline" className="shrink-0 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs">
                {results.length} leads found
              </Badge>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[170px] h-8 bg-[#16161f] border-slate-700/50 text-slate-400 text-xs rounded-lg">
                  <ArrowUpDown className="w-3 h-3 mr-1.5 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-slate-700/50 text-white z-50">
                  <SelectItem value="relevance" className="text-sm">Relevance</SelectItem>
                  <SelectItem value="budget-high" className="text-sm">Budget: High → Low</SelectItem>
                  <SelectItem value="budget-low" className="text-sm">Budget: Low → High</SelectItem>
                  <SelectItem value="probability" className="text-sm">Success Probability</SelectItem>
                  <SelectItem value="newest" className="text-sm">Newest First</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={onSaveSearch}
                variant="outline"
                size="sm"
                className="h-8 border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 text-xs"
              >
                <Save className="w-3 h-3 mr-1 shrink-0" />
                Save Search
              </Button>
              <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="h-8 border-slate-700/50 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 text-xs"
              >
                <Download className="w-3 h-3 mr-1 shrink-0" />
                Export
              </Button>
            </div>
          </div>
          {results.length === 0 && (
            <Card className="border-0 bg-[#12121a] overflow-hidden">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0">
                  <Search className="w-8 h-8 text-slate-600 shrink-0" />
                </div>
                <h3 className="text-lg font-semibold text-slate-400">No Results Found</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Try adjusting your filters or search query to find matching leads.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {results.map((lead, i) => (
              <Card
                key={lead.id}
                className="group border-0 bg-[#12121a] hover:bg-[#16161f] hover:border-indigo-500/20 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/5 overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-rose-500/10 border border-slate-700/50 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                            {lead.title}
                          </h3>
                          <p className="text-sm text-slate-400 truncate">{lead.company}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 pl-[52px] line-clamp-2">
                        {lead.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 pl-[52px]">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lead.country}</span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Target className="w-3.5 h-3.5 shrink-0" />
                          <span>{lead.successProbability}% match</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-[52px] pt-1">
                        {lead.technologies?.map((tech, ti) => (
                          <span
                            key={tech}
                            className={cn(
                              "px-2 py-0.5 rounded-md text-xs font-medium border shrink-0",
                              technologyColors[ti % technologyColors.length]
                            )}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold shrink-0",
                        lead.successProbability >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : lead.successProbability >= 60
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      )}>
                        {lead.successProbability}%
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast(`Viewing details for "${lead.title}"`);
                          }}
                          className="h-7 px-2 border-slate-700/50 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 text-[10px] rounded-md"
                        >
                          <Eye className="w-3 h-3 mr-1 shrink-0" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast(`Applied to "${lead.title}"`);
                          }}
                          className="h-7 px-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-[10px] rounded-md"
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            showToast(`Saved "${lead.title}"`);
                          }}
                          className="h-7 px-2 border-slate-700/50 text-slate-500 hover:text-rose-400 hover:border-rose-500/30 text-[10px] rounded-md"
                        >
                          <Bookmark className="w-3 h-3 shrink-0" />
                        </Button>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isSearching && !hasSearched && (
        <Card className="border-0 bg-[#12121a] overflow-hidden">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0">
              <Search className="w-8 h-8 text-slate-600 shrink-0" />
            </div>
            <h3 className="text-lg font-semibold text-slate-400">Start a Search</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Type a natural language query above to discover high-value leads matched by our AI engine.
            </p>
            <div className="flex flex-wrap gap-2 pt-4 max-w-xl justify-center">
              {suggestedSearches.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestedClick(s)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30 transition-all duration-200 text-left leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export { SearchResults };
