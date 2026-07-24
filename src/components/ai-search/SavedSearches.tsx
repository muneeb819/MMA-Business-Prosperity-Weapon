"use client";

import React from "react";
import {
  Sparkles,
  History,
  Users,
  Brain,
  Clock,
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
import { timeAgo, cn, formatNumber } from "@/lib/utils";
import { mockAgents } from "@/lib/mock-data";
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
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            Suggested Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {suggestedSearches.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestedClick(s)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-200 text-left leading-relaxed"
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
          {[
            { query: "SaaS startups Series A-B", results: 14, timestamp: Date.now() - 1800000 },
            { query: "E-commerce logistics automation", results: 8, timestamp: Date.now() - 7200000 },
            { query: "Healthcare digital transformation", results: 22, timestamp: Date.now() - 86400000 },
          ].map((r) => (
            <button
              key={r.query}
              onClick={() => onSuggestedClick(r.query)}
              className="w-full p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200 text-left group overflow-hidden"
            >
              <div className="flex items-center justify-between min-w-0">
                <p className="text-sm text-slate-300 truncate pr-2 group-hover:text-white transition-colors">
                  {r.query}
                </p>
                <Badge variant="outline" className="shrink-0 border-slate-700/50 text-slate-500 text-[10px] bg-slate-800/50">
                  {r.results}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-600">
                <Clock className="w-3 h-3 shrink-0" />
                {timeAgo(new Date(r.timestamp))}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 bg-[#12121a] overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
            Active Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {mockAgents.map((agent) => (
            <div
              key={agent.id}
              className="p-3 rounded-lg bg-slate-800/30 border border-transparent hover:border-slate-700/50 transition-all min-w-0 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5 min-w-0">
                <span className="text-xs font-medium text-slate-300 truncate min-w-0">{agent.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px] border px-1.5 py-0",
                    agent.status === "scanning"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : agent.status === "analyzing"
                        ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                        : "border-purple-500/30 text-purple-400 bg-purple-500/10"
                  )}
                >
                  {agent.status}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {agent.currentTask || agent.description}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                <span>{agent.efficiency}% efficiency</span>
                <span>·</span>
                <span>{formatNumber(agent.tasksCompleted)} tasks</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-cyan-500/20 overflow-hidden">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-sm font-semibold text-white">AI Insight</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Based on your recent activity, prospects in the fintech sector have shown a{" "}
            <span className="text-cyan-400 font-medium">34% higher engagement rate</span>{" "}
            this week. Consider refining your search toward Series A-B startups.
          </p>
        </CardContent>
      </Card>

      {savedSearches.length > 0 && (
        <Card className="border-0 bg-[#12121a] overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400 shrink-0" />
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
                    className="text-sm text-slate-300 hover:text-cyan-300 transition-colors truncate text-left min-w-0"
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
