"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Brain,
  Globe,
  MapPin,
  DollarSign,
  Clock,
  Target,
  Filter,
  ArrowRight,
  Loader2,
  Zap,
  TrendingUp,
  Building2,
  Users,
  History,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatCurrency,
  timeAgo,
  cn,
} from "@/lib/utils";
import { mockLeads } from "@/lib/mock-data";

const suggestedSearches = [
  "SaaS companies in need of data pipelines",
  "Marketing agencies looking for automation",
  "E-commerce stores with growing support tickets",
  "Fintech startups needing infrastructure migration",
  "Healthcare clinics needing patient portal",
  "Real estate firms with outdated CRM systems",
];

const recentSearches = [
  { query: "SaaS startups Series A-B", results: 14, timestamp: Date.now() - 1800000 },
  { query: "E-commerce logistics automation", results: 8, timestamp: Date.now() - 7200000 },
  { query: "Healthcare digital transformation", results: 22, timestamp: Date.now() - 86400000 },
];

const countries = [
  "All Countries",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "Australia",
  "Singapore",
  "Netherlands",
];

const jobTypes = [
  "All Types",
  "Full-time",
  "Contract",
  "Part-time",
  "Freelance",
  "Project-based",
];

const budgetRanges = [
  "Any Budget",
  "$5k - $25k",
  "$25k - $50k",
  "$50k - $100k",
  "$100k - $250k",
  "$250k+",
];

const technologyColors = [
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
];

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All Countries");
  const [jobType, setJobType] = useState("All Types");
  const [budget, setBudget] = useState("Any Budget");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState(mockLeads.slice(0, 6));

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const shuffled = [...mockLeads].sort(() => 0.5 - Math.random());
      setResults(shuffled.slice(0, Math.floor(Math.random() * 5) + 4));
      setIsSearching(false);
    }, 2200);
  }, [query]);

  const handleSuggestedClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const shuffled = [...mockLeads].sort(() => 0.5 - Math.random());
      setResults(shuffled.slice(0, Math.floor(Math.random() * 6) + 3));
      setIsSearching(false);
    }, 1800);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

            {/* Hero Search Area */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#12121a] to-[#0d0d14] shadow-2xl shadow-cyan-500/5">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
              <CardContent className="relative p-10">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                      AI-Powered Lead Discovery
                    </h1>
                    <p className="text-slate-400 mt-2 text-base max-w-xl mx-auto">
                      Use natural language to find your ideal prospects. Our AI understands context, intent, and relevance.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="w-full max-w-2xl relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
                    <div className="relative flex items-center bg-[#16161f] border border-slate-700/50 rounded-xl overflow-hidden group-focus-within:border-cyan-500/40 transition-colors duration-300">
                      <div className="pl-4 text-cyan-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Describe what you're looking for in natural language..."
                        className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base"
                      />
                      <div className="pr-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <Button
                          onClick={handleSearch}
                          disabled={!query.trim() || isSearching}
                          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 h-10 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                        >
                          {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-1.5" />
                              AI Search
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                    </div>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="w-[180px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg focus:ring-cyan-500/30 focus:border-cyan-500/40">
                        <Globe className="w-3.5 h-3.5 mr-2 text-slate-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-slate-700/50 text-white">
                        {countries.map((c) => (
                          <SelectItem key={c} value={c} className="text-sm focus:bg-cyan-500/10 focus:text-cyan-300">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger className="w-[180px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg focus:ring-cyan-500/30 focus:border-cyan-500/40">
                        <Target className="w-3.5 h-3.5 mr-2 text-slate-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-slate-700/50 text-white">
                        {jobTypes.map((t) => (
                          <SelectItem key={t} value={t} className="text-sm focus:bg-cyan-500/10 focus:text-cyan-300">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger className="w-[180px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg focus:ring-cyan-500/30 focus:border-cyan-500/40">
                        <DollarSign className="w-3.5 h-3.5 mr-2 text-slate-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-slate-700/50 text-white">
                        {budgetRanges.map((b) => (
                          <SelectItem key={b} value={b} className="text-sm focus:bg-cyan-500/10 focus:text-cyan-300">
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Area */}
            <div className="flex gap-8">

              {/* Results Area */}
              <div className="flex-1 min-w-0">

                {/* Loading State */}
                {isSearching && (
                  <Card className="border-0 bg-[#12121a] border-slate-800/50">
                    <CardContent className="p-12 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center justify-center">
                          <Brain className="w-10 h-10 text-cyan-400 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold text-white">AI is analyzing your query</h3>
                        <p className="text-slate-400 text-sm">Matching against millions of prospects and signals...</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm ml-1">Processing</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results */}
                {!isSearching && hasSearched && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">Search Results</h2>
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs">
                          {results.length} leads found
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-500">Sorted by relevance</span>
                    </div>
                    <div className="space-y-3">
                      {results.map((lead, i) => (
                        <Link key={lead.id} href={`/leads/${lead.id}`}>
                          <Card className="group border-0 bg-[#12121a] hover:bg-[#16161f] border-slate-800/50 hover:border-cyan-500/20 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5"
                            style={{ animationDelay: `${i * 80}ms` }}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-slate-700/50 flex items-center justify-center shrink-0">
                                      <Building2 className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                                        {lead.title}
                                      </h3>
                                      <p className="text-sm text-slate-400 truncate">{lead.company}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-slate-500 pl-[52px]">
                                    <span className="flex items-center gap-1.5">
                                      <Globe className="w-3.5 h-3.5" />
                                      {lead.country}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <DollarSign className="w-3.5 h-3.5" />
                                      {formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Target className="w-3.5 h-3.5" />
                                      {lead.successProbability}% match
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pl-[52px] pt-1">
                                    {lead.technologies?.map((tech, ti) => (
                                      <span
                                        key={tech}
                                        className={cn(
                                          "px-2 py-0.5 rounded-md text-xs font-medium border",
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
                                    "px-3 py-1 rounded-full text-xs font-semibold",
                                    lead.successProbability >= 80
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : lead.successProbability >= 60
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                  )}>
                                    {lead.successProbability}%
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isSearching && !hasSearched && (
                  <Card className="border-0 bg-[#12121a] border-slate-800/50">
                    <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <Search className="w-8 h-8 text-slate-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-400">Start a Search</h3>
                      <p className="text-slate-500 text-sm max-w-sm">
                        Type a natural language query above to discover high-value leads matched by our AI engine.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="w-80 shrink-0 space-y-6">

                {/* Suggested Searches */}
                <Card className="border-0 bg-[#12121a] border-slate-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Suggested Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {suggestedSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestedClick(s)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-200 text-left leading-relaxed"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Searches */}
                <Card className="border-0 bg-[#12121a] border-slate-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      Recent Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {recentSearches.map((r) => (
                      <button
                        key={r.query}
                        onClick={() => handleSuggestedClick(r.query)}
                        className="w-full p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-300 truncate pr-2 group-hover:text-white transition-colors">
                            {r.query}
                          </p>
                          <Badge variant="outline" className="shrink-0 border-slate-700/50 text-slate-500 text-[10px] bg-slate-800/50">
                            {r.results}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-600">
                          <Clock className="w-3 h-3" />
                          {timeAgo(new Date(r.timestamp))}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Insight Card */}
                <Card className="border-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-cyan-500/20">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-white">AI Insight</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Based on your recent activity, prospects in the fintech sector have shown a{" "}
                      <span className="text-cyan-400 font-medium">34% higher engagement rate</span>{" "}
                      this week. Consider refining your search toward Series A-B startups.
                    </p>
                  </CardContent>
                </Card>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
