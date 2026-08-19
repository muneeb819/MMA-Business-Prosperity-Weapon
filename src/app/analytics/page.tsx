"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { mockAnalytics } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { AnalyticsData } from "@/lib/types";
import { KpiCards } from "@/components/analytics/KpiCards";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { CountryBreakdown } from "@/components/analytics/CountryBreakdown";
import { TechBreakdown } from "@/components/analytics/TechBreakdown";
import { AgentPerformance } from "@/components/analytics/AgentPerformance";
import { BarChart3, DollarSign, Target, Globe, Zap, Download, Layers, Brain, TrendingUp, Briefcase, FileText, RefreshCw, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

type SortField = "count" | "revenue" | "name";
type SortDir = "asc" | "desc";
const PERIODS = [{ label: "7d", value: "7d" }, { label: "30d", value: "30d" }, { label: "90d", value: "90d" }, { label: "1y", value: "1y" }] as const;

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { timerRef.current = setTimeout(onDone, 3000); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl shadow-black/40">
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><span className="text-emerald-400 text-xs">✓</span></div>
        <span className="text-sm text-zinc-200">{message}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  useEffect(() => { document.title = "Analytics | MBPW"; }, []);
  const [data, setData] = useState<AnalyticsData>(mockAnalytics);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("1y");
  const [activeTab, setActiveTab] = useState("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [countrySort, setCountrySort] = useState<{ field: SortField; dir: SortDir }>({ field: "count", dir: "desc" });
  const [techSort, setTechSort] = useState<{ field: SortField; dir: SortDir }>({ field: "count", dir: "desc" });
  const [platformSort, setPlatformSort] = useState<{ field: SortField; dir: SortDir }>({ field: "count", dir: "desc" });
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [showAllAgents, setShowAllAgents] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const result = await api.analytics.get(selectedPeriod);
        if (!cancelled && result && typeof result === "object" && "totalLeads" in result) {
          setData(result);
        }
      } catch {
        // API unavailable — keep mockAnalytics
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => { cancelled = true; };
  }, [selectedPeriod]);

  const filteredMonthlyRevenue = useCallback(() => {
    const all = data.monthlyRevenue;
    switch (selectedPeriod) {
      case "7d": return all.slice(-1);
      case "30d": return all.slice(-2);
      case "90d": return all.slice(-3);
      default: return all;
    }
  }, [data.monthlyRevenue, selectedPeriod])();
  const maxMonthlyRevenue = Math.max(...filteredMonthlyRevenue.map((m) => m.revenue), 1);
  const showToast = useCallback((msg: string) => { setToast(msg); }, []);
  const toggleSort = useCallback(
    (current: { field: SortField; dir: SortDir }, setFn: (s: { field: SortField; dir: SortDir }) => void, field: SortField) => {
      setFn(current.field === field ? { field, dir: current.dir === "asc" ? "desc" : "asc" } : { field, dir: "desc" });
    }, []
  );

  const sortedCountries = [...data.topCountries].sort((a, b) => {
    const m = countrySort.dir === "asc" ? 1 : -1;
    if (countrySort.field === "name") return m * a.country.localeCompare(b.country);
    if (countrySort.field === "revenue") return m * (a.revenue - b.revenue);
    return m * (a.count - b.count);
  });
  const sortedTech = [...data.topTechnologies].sort((a, b) => {
    const m = techSort.dir === "asc" ? 1 : -1;
    if (techSort.field === "name") return m * a.tech.localeCompare(b.tech);
    return m * (a.count - b.count);
  });
  const sortedPlatforms = [...data.platformBreakdown].sort((a, b) => {
    const m = platformSort.dir === "asc" ? 1 : -1;
    if (platformSort.field === "name") return m * a.platform.localeCompare(b.platform);
    return m * (a.leads - b.leads);
  });

  const kpis = [
    { label: "Total Leads", value: formatNumber(data.totalLeads), trend: "+12.5%", up: true, icon: Target, color: "text-cyan-400", glow: "bg-cyan-500/10" },
    { label: "Total Proposals", value: String(data.totalProposals), trend: "+8.2%", up: true, icon: FileText, color: "text-violet-400", glow: "bg-violet-500/10" },
    { label: "Win Rate", value: `${data.winRate}%`, trend: "+3.1%", up: true, icon: TrendingUp, color: "text-emerald-400", glow: "bg-emerald-500/10" },
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue), trend: "+18.7%", up: true, icon: DollarSign, color: "text-amber-400", glow: "bg-amber-500/10" },
    { label: "Avg Deal Size", value: formatCurrency(data.avgDealSize), trend: "-2.3%", up: false, icon: Briefcase, color: "text-rose-400", glow: "bg-rose-500/10" },
    { label: "Conversion Rate", value: `${data.conversionRate}%`, trend: "+5.4%", up: true, icon: Zap, color: "text-blue-400", glow: "bg-blue-500/10" },
  ];

  const handleExportCSV = useCallback(() => {
    const rows = [["Metric", "Value"], ...kpis.map((k) => [k.label, k.value])];
    rows.push([], ["Country", "Count", "Revenue"]);
    data.topCountries.forEach((c) => rows.push([c.country, String(c.count), String(c.revenue)]));
    rows.push([], ["Technology", "Count"]);
    data.topTechnologies.forEach((t) => rows.push([t.tech, String(t.count)]));
    rows.push([], ["Platform", "Leads"]);
    data.platformBreakdown.forEach((p) => rows.push([p.platform, String(p.leads)]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Report exported as CSV");
  }, [kpis, data, showToast]);

  const techBreakdownProps = {
    techItems: sortedTech, platformItems: sortedPlatforms,
    techSort, platformSort,
    onToggleTechSort: (f: SortField) => toggleSort(techSort, setTechSort, f),
    onTogglePlatformSort: (f: SortField) => toggleSort(platformSort, setPlatformSort, f),
    showAllTech, showAllPlatforms,
    onToggleShowAllTech: () => setShowAllTech(!showAllTech),
    onToggleShowAllPlatforms: () => setShowAllPlatforms(!showAllPlatforms),
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Breadcrumbs />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0"><BarChart3 className="w-6 h-6 text-violet-400" /></div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate">Analytics</h1>
                <p className="text-sm text-zinc-500 truncate">{loading ? "Loading analytics..." : "AI-powered business intelligence"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
                {PERIODS.map((p) => (
                  <button key={p.value} onClick={() => setSelectedPeriod(p.value)}
                    className={cn("px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 min-h-9",
                      selectedPeriod === p.value ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}>{p.label}</button>
                ))}
              </div>
              <Button variant="outline" className="border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800"
                onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1200); }} disabled={isRefreshing}>
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />{isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" className="border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />Export CSV
              </Button>
            </div>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-zinc-400">Loading analytics data...</span>
            </div>
          )}
          <KpiCards kpis={kpis} />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900/80 border border-zinc-800/80 p-1 h-auto">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><DollarSign className="w-4 h-4 mr-1.5 shrink-0" />Revenue</TabsTrigger>
              <TabsTrigger value="countries" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Globe className="w-4 h-4 mr-1.5 shrink-0" />Countries</TabsTrigger>
              <TabsTrigger value="technologies" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Layers className="w-4 h-4 mr-1.5 shrink-0" />Technologies</TabsTrigger>
              <TabsTrigger value="platforms" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Zap className="w-4 h-4 mr-1.5 shrink-0" />Platforms</TabsTrigger>
              <TabsTrigger value="ai-agents" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Brain className="w-4 h-4 mr-1.5 shrink-0" />AI Agents</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="mt-4">
              <RevenueChart monthlyRevenue={filteredMonthlyRevenue} maxMonthlyRevenue={maxMonthlyRevenue} industryTrends={data.industryTrends} isRefreshing={isRefreshing} />
            </TabsContent>
            <TabsContent value="countries" className="mt-4">
              <CountryBreakdown countries={sortedCountries} totalCount={data.topCountries.length} sort={countrySort} onToggleSort={(f) => toggleSort(countrySort, setCountrySort, f)} showAll={showAllCountries} onToggleShowAll={() => setShowAllCountries(!showAllCountries)} />
            </TabsContent>
            <TabsContent value="technologies" className="mt-4">
              <TechBreakdown {...techBreakdownProps} />
            </TabsContent>
            <TabsContent value="platforms" className="mt-4">
              <div className="bg-zinc-900/80 border-zinc-800/80 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Leads by Platform</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleSort(platformSort, setPlatformSort, "count")}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md transition-colors shrink-0 min-h-9 ${platformSort.field === "count" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}>
                      Count <ArrowUpDown className={`w-3 h-3 ${platformSort.field === "count" ? "text-violet-400" : ""}`} />
                    </button>
                    <button onClick={() => toggleSort(platformSort, setPlatformSort, "name")}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md transition-colors shrink-0 min-h-9 ${platformSort.field === "name" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"}`}>
                      Name <ArrowUpDown className={`w-3 h-3 ${platformSort.field === "name" ? "text-violet-400" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {sortedPlatforms.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-8">No platform data available</p>
                  ) : (
                    <>
                      {(showAllPlatforms ? sortedPlatforms : sortedPlatforms.slice(0, 5)).map((p) => {
                        const maxLeads = Math.max(...sortedPlatforms.map((x) => x.leads), 1);
                        return (
                          <div key={p.platform} className="flex items-center gap-4">
                            <span className="text-sm font-medium text-zinc-300 w-28 shrink-0 truncate">{p.platform}</span>
                            <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                              <div className="h-full rounded-lg bg-gradient-to-r from-blue-600/80 to-blue-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3"
                                style={{ width: `${(p.leads / maxLeads) * 100}%` }}>
                                <span className="text-xs font-semibold text-white drop-shadow-lg">{p.leads}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {sortedPlatforms.length > 5 && (
                        <button onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40">
                          {showAllPlatforms ? <>Show Less <ChevronUp className="w-3 h-3" /></> : <>See All ({sortedPlatforms.length}) <ChevronDown className="w-3 h-3" /></>}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ai-agents" className="mt-4">
              <AgentPerformance agents={data.agentPerformance} totalCount={data.agentPerformance.length} showAll={showAllAgents} onToggleShowAll={() => setShowAllAgents(!showAllAgents)} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
