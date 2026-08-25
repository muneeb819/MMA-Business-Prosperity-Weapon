"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { SearchHero } from "@/components/ai-search/SearchHero";
import { SearchFilters } from "@/components/ai-search/SearchFilters";
import { SearchResults } from "@/components/ai-search/SearchResults";
import { SavedSearches } from "@/components/ai-search/SavedSearches";
import { getStoredLeads, type LiveLead } from "@/lib/live-sources";
import { api } from "@/lib/api";
import { Lead } from "@/lib/types";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Footer } from "@/components/footer";

interface SavedSearch { query: string; timestamp: number; resultCount: number }

function liveLeadsToLeads(lls: LiveLead[]): Lead[] {
  return lls.map((ll) => ({
    id: ll.id, title: ll.title, description: ll.description,
    clientName: ll.company, company: ll.company, email: "", phone: "",
    country: ll.country || "", budget: { min: ll.salaryMin || 0, max: ll.salaryMax || 0 },
    deadline: "", technologies: ll.technologies, skills: [], platform: ll.platform,
    jobType: "full_time", status: "new" as const, urgency: "medium" as const,
    difficulty: 50, successProbability: 60, riskLevel: "medium",
    expectedRevenue: (ll.salaryMax || 0) * 0.3, competition: 0,
    projectSize: "medium", paymentMethod: "Escrow",
    clientHistory: `Sourced from ${ll.source}`, url: ll.url,
    notes: `Live lead from ${ll.source}`, tags: ll.tags,
    foundAt: ll.publishedAt || new Date().toISOString(), analyzedAt: undefined,
  }));
}

function sortLeads(leads: Lead[], sortBy: string): Lead[] {
  const sorted = [...leads];
  switch (sortBy) {
    case "budget-high": sorted.sort((a, b) => b.budget.max - a.budget.max); break;
    case "budget-low": sorted.sort((a, b) => a.budget.min - b.budget.min); break;
    case "probability": sorted.sort((a, b) => b.successProbability - a.successProbability); break;
    case "newest": sorted.sort((a, b) => new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()); break;
  }
  return sorted;
}

function mapSearchResultToLead(r: any): Lead {
  return {
    id: r.id,
    title: r.title,
    description: r.description || "",
    clientName: r.company || "Client",
    company: r.company || "Company",
    email: "",
    phone: "",
    country: r.country || "Global",
    budget: { min: r.budget_min || 0, max: r.budget_max || 0 },
    deadline: "",
    technologies: r.technologies || [],
    skills: [],
    platform: r.source || "",
    jobType: "contract",
    status: "new",
    urgency: "medium",
    difficulty: 50,
    successProbability: r.success_probability || 50,
    riskLevel: "medium",
    expectedRevenue: 0,
    competition: 0,
    projectSize: "medium",
    paymentMethod: "Escrow",
    clientHistory: "",
    url: r.url || "",
    notes: "",
    tags: [],
    foundAt: new Date().toISOString(),
  };
}

export default function AISearchPage() {
  useEffect(() => { document.title = "AI Search | MBPW"; }, []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mbpw_saved_searches");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    localStorage.setItem("mbpw_saved_searches", JSON.stringify(savedSearches));
  }, [savedSearches]);

  const applyFilters = useCallback(
    (leads: Lead[]) => {
      let filtered = [...leads];
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter((l) =>
          l.title.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) || l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.technologies.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (countryFilter !== "All Countries") filtered = filtered.filter((l) => l.country === countryFilter);
      if (budgetMin || budgetMax) {
        const min = budgetMin ? parseFloat(budgetMin) : 0;
        const max = budgetMax ? parseFloat(budgetMax) : Infinity;
        filtered = filtered.filter((l) => l.budget.max >= min && l.budget.min <= max);
      }
      if (selectedTechs.length > 0) filtered = filtered.filter((l) => selectedTechs.some((t) => l.technologies.includes(t)));
      return sortLeads(filtered, sortBy);
    },
    [query, countryFilter, budgetMin, budgetMax, selectedTechs, sortBy]
  );

  const executeSearch = useCallback(async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await api.search.search({
        query,
        country: countryFilter !== "All Countries" ? countryFilter : undefined,
        budget_min: budgetMin ? parseFloat(budgetMin) : undefined,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
        technologies: selectedTechs.length > 0 ? selectedTechs : undefined,
        sort_by: sortBy,
      }) as any;
      if (data?.results) {
        const mapped = data.results.map(mapSearchResultToLead);
        setResults(mapped);
        if (data.ai_interpretation?.understanding) {
          setAiInterpretation(data.ai_interpretation.understanding);
        }
      } else {
        const filtered = applyFilters(liveLeadsToLeads(getStoredLeads()));
        setResults(filtered);
      }
    } catch {
      const filtered = applyFilters(liveLeadsToLeads(getStoredLeads()));
      setResults(filtered);
    }
    setIsSearching(false);
  }, [query, countryFilter, budgetMin, budgetMax, selectedTechs, sortBy, applyFilters]);

  useEffect(() => {
    if (!hasSearched || results.length === 0) return;
    setResults((prev) => sortLeads(prev, sortBy));
  }, [sortBy, hasSearched, results.length]);

  const handleSearch = useCallback(() => {
    if (!query.trim() && countryFilter === "All Countries" && selectedTechs.length === 0) {
      showToast("Please enter a search query or set a filter"); return;
    }
    executeSearch();
  }, [query, countryFilter, selectedTechs, executeSearch, showToast]);

  const handleSuggestedClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setIsSearching(true);
    setHasSearched(true);
    (async () => {
      try {
        const data = await api.search.search({ query: suggestion }) as any;
        if (data?.results) {
          setResults(data.results.map(mapSearchResultToLead));
          if (data.ai_interpretation?.understanding) {
            setAiInterpretation(data.ai_interpretation.understanding);
          }
        } else {
          const q = suggestion.toLowerCase();
          const filtered = liveLeadsToLeads(getStoredLeads()).filter((l) =>
            l.title.toLowerCase().includes(q) || l.company.toLowerCase().includes(q)
          );
          setResults(filtered);
        }
      } catch {
        const q = suggestion.toLowerCase();
        const filtered = liveLeadsToLeads(getStoredLeads()).filter((l) =>
          l.title.toLowerCase().includes(q) || l.company.toLowerCase().includes(q)
        );
        setResults(filtered);
      }
      setIsSearching(false);
    })();
  }, []);

  const handleClearFilters = useCallback(() => {
    setCountryFilter("All Countries"); setBudgetMin(""); setBudgetMax("");
    setSelectedTechs([]); setSortBy("relevance"); showToast("All filters cleared");
  }, [showToast]);

  const handleApplyFilters = useCallback(() => {
    if (!hasSearched) { showToast("Run a search first before applying filters"); return; }
    executeSearch();
  }, [hasSearched, executeSearch, showToast]);

  const handleSaveSearch = useCallback(() => {
    if (!query.trim()) { showToast("Enter a query to save"); return; }
    setSavedSearches((prev) => [{ query, timestamp: Date.now(), resultCount: results.length }, ...prev]);
    showToast("Search saved successfully");
  }, [query, results.length, showToast]);

  const handleExport = useCallback(() => {
    if (results.length === 0) { showToast("No results to export"); return; }
    const headers = ["Title", "Company", "Country", "Budget Min", "Budget Max", "Probability", "Technologies"];
    const rows = results.map((l) => [
      `"${l.title}"`, `"${l.company}"`, l.country,
      l.budget.min, l.budget.max, l.successProbability || 0,
      `"${l.technologies.join(", ")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${results.length} results`);
  }, [results, showToast]);

  const toggleTech = useCallback((tech: string) => {
    setSelectedTechs((prev) => prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]);
  }, []);

  const deleteSavedSearch = useCallback((index: number) => {
    setSavedSearches((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const totalActiveFilters =
    (countryFilter !== "All Countries" ? 1 : 0) + (budgetMin ? 1 : 0) + (budgetMax ? 1 : 0) + selectedTechs.length;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
            <Breadcrumbs />
            <SearchHero query={query} onQueryChange={setQuery} onSearch={handleSearch} isSearching={isSearching} onSuggestedClick={handleSuggestedClick} />
            {aiInterpretation && (
              <div className="bg-cyan-500/[0.06] border border-cyan-500/20 rounded-xl px-5 py-3 text-sm text-cyan-300/80">
                <span className="font-semibold text-cyan-300">AI Understanding:</span> {aiInterpretation}
              </div>
            )}
            <SearchFilters countryFilter={countryFilter} onCountryChange={setCountryFilter} budgetMin={budgetMin} onBudgetMinChange={setBudgetMin} budgetMax={budgetMax} onBudgetMaxChange={setBudgetMax} selectedTechs={selectedTechs} onToggleTech={toggleTech} onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} totalActiveFilters={totalActiveFilters} availableTechs={Array.from(new Set(results.flatMap((l) => l.technologies))).sort()} />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 min-w-0 space-y-4">
                <SearchResults results={results} isSearching={isSearching} hasSearched={hasSearched} sortBy={sortBy} onSortChange={setSortBy} onSaveSearch={handleSaveSearch} onExport={handleExport} onSuggestedClick={handleSuggestedClick} showToast={showToast} />
              </div>
              <SavedSearches savedSearches={savedSearches} onDeleteSaved={deleteSavedSearch} onSuggestedClick={handleSuggestedClick} showToast={showToast} />
            </div>
          </div>
          <Footer />
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-5 py-3 bg-[#1a1a24] border border-cyan-500/30 rounded-xl shadow-xl shadow-cyan-500/10 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-sm text-slate-200 min-w-0">{toast}</span>
            <button onClick={() => { setToast(null); if (toastTimer.current) clearTimeout(toastTimer.current); }} className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
