"use client";

import React from "react";
import {
  Brain,
  Search,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestedSearches = [
  "React developers in Europe",
  "SaaS companies in need of data pipelines",
  "Marketing agencies looking for automation",
  "E-commerce stores with growing support tickets",
  "Fintech startups needing infrastructure migration",
  "Healthcare clinics needing patient portal",
  "Real estate firms with outdated CRM systems",
];

interface SearchHeroProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  onSuggestedClick: (s: string) => void;
}

const SearchHero = React.memo(function SearchHero({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  onSuggestedClick,
}: SearchHeroProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#12121a] to-[#0d0d14] shadow-2xl shadow-indigo-500/5">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5" />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
      <CardContent className="relative p-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Brain className="w-8 h-8 text-indigo-400 shrink-0" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-rose-300 bg-clip-text text-transparent">
              AI-Powered Lead Discovery
            </h1>
            <p className="text-slate-400 mt-2 text-base max-w-xl mx-auto">
              Use natural language to find your ideal prospects. Our AI understands context, intent, and relevance.
            </p>
          </div>

          <div className="w-full max-w-2xl relative group">
            <div className="absolute -inset-0.5 pointer-events-none bg-gradient-to-r from-indigo-500/30 via-rose-500/30 to-indigo-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
            <div className="relative flex items-center bg-[#16161f] border border-slate-700/50 rounded-xl overflow-hidden group-focus-within:border-indigo-500/40 transition-colors duration-300">
              <div className="pl-4 text-indigo-400 shrink-0">
                <Search className="w-5 h-5 shrink-0" />
              </div>
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="Describe what you're looking for in natural language..."
                className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base min-w-0"
              />
              <div className="pr-3 flex items-center gap-2 shrink-0">
                <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                <Button
                  onClick={onSearch}
                  disabled={isSearching}
                  className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white border-0 h-10 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 shrink-0"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-1.5 shrink-0" />
                      AI Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { SearchHero, suggestedSearches };
