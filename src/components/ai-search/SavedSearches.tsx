"use client";

import React from "react";
import {
  Sparkles,
  History,
  Users,
  Bookmark,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { suggestedSearches } from "./SearchHero";

interface SavedSearch {
  query: string;
  timestamp: number;
  resultCount: number;
}

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onDeleteSaved: (index: number) => void;
  onSuggestedClick: (s: string) => void;
  showToast: (msg: string) => void;
}

const SavedSearches = React.memo(function SavedSearches({
  savedSearches,
  onDeleteSaved,
  onSuggestedClick,
  showToast,
}: SavedSearchesProps) {
  return (
    <div className="w-full lg:w-80 shrink-0 space-y-6">
      <Card className="border-0 bg-[#12121a] overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
            Suggested Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {suggestedSearches.map((s) => (
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

      <Card className="border-0 bg-[#12121a] overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500 shrink-0" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {savedSearches.length === 0 ? (
            <p className="text-xs text-slate-600 py-2">No recent searches yet.</p>
          ) : (
            savedSearches.slice(0, 5).map((s, i) => (
              <button
                key={`${s.timestamp}-${i}`}
                onClick={() => onSuggestedClick(s.query)}
                className="w-full p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200 text-left group overflow-hidden"
              >
                <div className="flex items-center justify-between min-w-0">
                  <p className="text-sm text-slate-300 truncate pr-2 group-hover:text-white transition-colors">
                    {s.query}
                  </p>
                  <Badge variant="outline" className="shrink-0 border-slate-700/50 text-slate-500 text-[10px] bg-slate-800/50">
                    {s.resultCount} results
                  </Badge>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-0 bg-[#12121a] overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            Active Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-slate-600 py-2">No active agents to display.</p>
        </CardContent>
      </Card>

      {savedSearches.length > 0 && (
        <Card className="border-0 bg-[#12121a] overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-rose-400 shrink-0" />
              Saved Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {savedSearches.map((s, i) => (
              <div
                key={`${s.timestamp}-${i}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-transparent group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onSuggestedClick(s.query)}
                    className="text-sm text-slate-300 hover:text-indigo-300 transition-colors truncate text-left min-w-0"
                  >
                    {s.query}
                  </button>
                  <Badge variant="outline" className="shrink-0 border-slate-700/50 text-slate-500 text-[10px] bg-slate-800/50">
                    {s.resultCount} results
                  </Badge>
                </div>
                <button
                  onClick={() => {
                    onDeleteSaved(i);
                    showToast("Saved search removed");
                  }}
                  className="shrink-0 ml-2 text-slate-600 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export { SavedSearches };
