"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  Bookmark,
  Download,
  X,
  Check,
  ArrowUpDown,
  Save,
  Eye,
  Trash2,
  Plus,
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
import {
  formatCurrency,
  formatNumber,
  timeAgo,
  cn,
} from "@/lib/utils";
import { mockLeads, mockAgents } from "@/lib/mock-data";
import { Lead, Agent } from "@/lib/types";

const allTechnologies = Array.from(
  new Set(mockLeads.flatMap((l) => l.technologies))
).sort();

const suggestedSearches = [
  "React developers in Europe",
  "SaaS companies in need of data pipelines",
  "Marketing agencies looking for automation",
  "E-commerce stores with growing support tickets",
  "Fintech startups needing infrastructure migration",
  "Healthcare clinics needing patient portal",
  "Real estate firms with outdated CRM systems",
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
  "India",
  "Brazil",
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
  const [results, setResults] = useState<Lead[]>([]);
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [savedSearches, setSavedSearches] = useState<
    { query: string; timestamp: number; resultCount: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const applyFilters = useCallback(
    (leads: Lead[]) => {
      let filtered = [...leads];

      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.tags.some((t) => t.toLowerCase().includes(q)) ||
            l.technologies.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (countryFilter !== "All Countries") {
        filtered = filtered.filter((l) => l.country === countryFilter);
      }

      const min = budgetMin ? parseFloat(budgetMin) : 0;
      const max = budgetMax ? parseFloat(budgetMax) : Infinity;
      if (budgetMin || budgetMax) {
        filtered = filtered.filter(
          (l) => l.budget.max >= min && l.budget.min <= max
        );
      }

      if (selectedTechs.length > 0) {
        filtered = filtered.filter((l) =>
          selectedTechs.some((t) => l.technologies.includes(t))
        );
      }

      switch (sortBy) {
        case "budget-high":
          filtered.sort((a, b) => b.budget.max - a.budget.max);
          break;
        case "budget-low":
          filtered.sort((a, b) => a.budget.min - b.budget.min);
          break;
        case "probability":
          filtered.sort(
            (a, b) => b.successProbability - a.successProbability
          );
          break;
        case "newest":
          filtered.sort(
            (a, b) =>
              new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
          );
          break;
        default:
          break;
      }

      return filtered;
    },
    [query, countryFilter, budgetMin, budgetMax, selectedTechs, sortBy]
  );

  const executeSearch = useCallback(() => {
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      const filtered = applyFilters(mockLeads);
      setResults(filtered.length > 0 ? filtered : mockLeads.slice(0, 3));
      setIsSearching(false);
    }, 1200 + Math.random() * 800);
  }, [applyFilters]);

  useEffect(() => {
    if (!hasSearched || results.length === 0) return;
    setResults((prev) => {
      const sorted = [...prev];
      switch (sortBy) {
        case "budget-high":
          sorted.sort((a, b) => b.budget.max - a.budget.max);
          break;
        case "budget-low":
          sorted.sort((a, b) => a.budget.min - b.budget.min);
          break;
        case "probability":
          sorted.sort((a, b) => b.successProbability - a.successProbability);
          break;
        case "newest":
          sorted.sort(
            (a, b) =>
              new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
          );
          break;
        default:
          break;
      }
      return sorted;
    });
  }, [sortBy, hasSearched, results.length]);

  const handleSearch = useCallback(() => {
    if (!query.trim() && countryFilter === "All Countries" && selectedTechs.length === 0) {
      showToast("Please enter a search query or set a filter");
      return;
    }
    executeSearch();
  }, [query, countryFilter, selectedTechs, executeSearch, showToast]);

  const handleSuggestedClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      setIsSearching(true);
      setHasSearched(true);
      setTimeout(() => {
        const q = suggestion.toLowerCase();
        const filtered = mockLeads.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.tags.some((t) => t.toLowerCase().includes(q)) ||
            l.technologies.some((t) => t.toLowerCase().includes(q)) ||
            l.country.toLowerCase().includes(q)
        );
        setResults(
          filtered.length > 0 ? filtered : mockLeads.slice(0, 3)
        );
        setIsSearching(false);
      }, 1200 + Math.random() * 800);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setCountryFilter("All Countries");
    setBudgetMin("");
    setBudgetMax("");
    setSelectedTechs([]);
    setSortBy("relevance");
    showToast("All filters cleared");
  }, [showToast]);

  const handleApplyFilters = useCallback(() => {
    if (!hasSearched) {
      showToast("Run a search first before applying filters");
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      const filtered = applyFilters(mockLeads);
      setResults(filtered.length > 0 ? filtered : []);
      setIsSearching(false);
      showToast(`Filters applied — ${filtered.length} results`);
    }, 800);
  }, [hasSearched, applyFilters, showToast]);

  const handleSaveSearch = useCallback(() => {
    if (!query.trim()) {
      showToast("Enter a query to save");
      return;
    }
    setSavedSearches((prev) => [
      { query, timestamp: Date.now(), resultCount: results.length },
      ...prev,
    ]);
    showToast("Search saved successfully");
  }, [query, results.length, showToast]);

  const handleExport = useCallback(() => {
    if (results.length === 0) {
      showToast("No results to export");
      return;
    }
    showToast(`Exporting ${results.length} leads to CSV`);
  }, [results.length, showToast]);

  const toggleTech = useCallback((tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  }, []);

  const totalActiveFilters =
    (countryFilter !== "All Countries" ? 1 : 0) +
    (budgetMin ? 1 : 0) +
    (budgetMax ? 1 : 0) +
    selectedTechs.length;

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

            {/* Hero Search Area */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#12121a] to-[#0d0d14] shadow-2xl shadow-cyan-500/5">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
              <CardContent className="relative p-10">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Brain className="w-8 h-8 text-cyan-400 shrink-0" />
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
                    <div className="absolute -inset-0.5 pointer-events-none bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
                    <div className="relative flex items-center bg-[#16161f] border border-slate-700/50 rounded-xl overflow-hidden group-focus-within:border-cyan-500/40 transition-colors duration-300">
                      <div className="pl-4 text-cyan-400 shrink-0">
                        <Search className="w-5 h-5 shrink-0" />
                      </div>
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Describe what you're looking for in natural language..."
                        className="border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base min-w-0"
                      />
                      <div className="pr-3 flex items-center gap-2 shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                        <Button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 h-10 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 shrink-0"
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

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm shrink-0">
                      <Filter className="w-4 h-4 shrink-0" />
                      <span>Filters</span>
                      {totalActiveFilters > 0 && (
                        <Badge variant="outline" className="shrink-0 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-[10px] px-1.5 py-0">
                          {totalActiveFilters}
                        </Badge>
                      )}
                    </div>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger className="w-[180px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg focus:ring-cyan-500/30 focus:border-cyan-500/40">
                        <Globe className="w-3.5 h-3.5 mr-2 text-slate-500 shrink-0" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-slate-700/50 text-white z-50">
                        {countries.map((c) => (
                          <SelectItem key={c} value={c} className="text-sm focus:bg-cyan-500/10 focus:text-cyan-300">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Budget Min */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 shrink-0" />
                        <Input
                          type="number"
                          placeholder="Min"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          className="w-[110px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg pl-7 focus:ring-cyan-500/30 focus:border-cyan-500/40"
                        />
                      </div>
                      <span className="text-slate-600 text-sm">—</span>
                      <div className="relative">
                        <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 shrink-0" />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          className="w-[110px] h-9 bg-[#16161f] border-slate-700/50 text-slate-300 text-sm rounded-lg pl-7 focus:ring-cyan-500/30 focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleApplyFilters}
                      variant="outline"
                      className="h-9 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-sm rounded-lg"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      onClick={handleClearFilters}
                      variant="ghost"
                      className="h-9 text-slate-500 hover:text-slate-300 text-sm rounded-lg"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technology Filter Chips */}
            <Card className="border-0 bg-[#12121a] overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-slate-500 shrink-0">Technologies:</span>
                  <div className="flex flex-wrap gap-2 min-w-0">
                    {allTechnologies.map((tech, ti) => (
                      <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200 shrink-0",
                          selectedTechs.includes(tech)
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
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

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Results Area */}
              <div className="flex-1 min-w-0 space-y-4">

                {/* Loading State */}
                {isSearching && (
                  <Card className="border-0 bg-[#12121a] overflow-hidden">
                    <CardContent className="p-12 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse pointer-events-none" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <Brain className="w-10 h-10 text-cyan-400 animate-pulse shrink-0" />
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
                      <div className="flex items-center gap-3 min-w-0">
                        <h2 className="text-lg font-semibold text-white shrink-0">Search Results</h2>
                        <Badge variant="outline" className="shrink-0 border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs">
                          {results.length} leads found
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Select value={sortBy} onValueChange={setSortBy}>
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
                          onClick={handleSaveSearch}
                          variant="outline"
                          size="sm"
                          className="h-8 border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 text-xs"
                        >
                          <Save className="w-3 h-3 mr-1 shrink-0" />
                          Save Search
                        </Button>
                        <Button
                          onClick={handleExport}
                          variant="outline"
                          size="sm"
                          className="h-8 border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 text-xs"
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
                          className="group border-0 bg-[#12121a] hover:bg-[#16161f] hover:border-cyan-500/20 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/5 overflow-hidden"
                          style={{ animationDelay: `${i * 80}ms` }}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-slate-700/50 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
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
                                    className="h-7 px-2 border-slate-700/50 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 text-[10px] rounded-md"
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
                                    className="h-7 px-2 border-slate-700/50 text-slate-500 hover:text-purple-400 hover:border-purple-500/30 text-[10px] rounded-md"
                                  >
                                    <Bookmark className="w-3 h-3 shrink-0" />
                                  </Button>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
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
                            onClick={() => handleSuggestedClick(s)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-200 text-left leading-relaxed"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Saved Searches */}
                {savedSearches.length > 0 && !isSearching && (
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
                              onClick={() => handleSuggestedClick(s.query)}
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
                              setSavedSearches((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
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

              {/* Right Sidebar */}
              <div className="w-full lg:w-80 shrink-0 space-y-6">

                {/* Suggested Searches */}
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
                        onClick={() => handleSuggestedClick(r.query)}
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

                {/* Agents Status */}
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

                {/* AI Insight Card */}
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

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-5 py-3 bg-[#1a1a24] border border-cyan-500/30 rounded-xl shadow-xl shadow-cyan-500/10 backdrop-blur-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-sm text-slate-200 min-w-0">{toast}</span>
            <button
              onClick={() => {
                setToast(null);
                if (toastTimer.current) clearTimeout(toastTimer.current);
              }}
              className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
