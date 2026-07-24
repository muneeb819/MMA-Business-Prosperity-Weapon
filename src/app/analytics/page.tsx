"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, formatPercentage, cn } from "@/lib/utils";
import { mockAnalytics } from "@/lib/mock-data";
import { AnalyticsData } from "@/lib/types";
import {
  BarChart3, TrendingUp, DollarSign, Target, Globe, Zap, Download,
  Layers, Brain, ArrowUpRight, Briefcase, FileText, RefreshCw,
  ArrowUpDown, ChevronDown, ChevronUp,
} from "lucide-react";

type SortField = "count" | "revenue" | "name";
type SortDir = "asc" | "desc";

const PERIODS = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
] as const;

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDone, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl shadow-black/40">
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <span className="text-emerald-400 text-xs">✓</span>
        </div>
        <span className="text-sm text-zinc-200">{message}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
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

  const data: AnalyticsData = mockAnalytics;

  const getFilteredMonthlyRevenue = useCallback(() => {
    const all = data.monthlyRevenue;
    switch (selectedPeriod) {
      case "7d": return all.slice(-1);
      case "30d": return all.slice(-2);
      case "90d": return all.slice(-3);
      case "1y":
      default: return all;
    }
  }, [data.monthlyRevenue, selectedPeriod]);

  const filteredMonthlyRevenue = getFilteredMonthlyRevenue();
  const maxMonthlyRevenue = Math.max(...filteredMonthlyRevenue.map((m) => m.revenue));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  }, []);

  const handleExport = useCallback(() => {
    showToast("Report exported successfully");
  }, [showToast]);

  const toggleSort = useCallback(
    (current: { field: SortField; dir: SortDir }, setFn: (s: { field: SortField; dir: SortDir }) => void, field: SortField) => {
      if (current.field === field) {
        setFn({ field, dir: current.dir === "asc" ? "desc" : "asc" });
      } else {
        setFn({ field, dir: "desc" });
      }
    },
    []
  );

  const sortedCountries = [...data.topCountries].sort((a, b) => {
    const mul = countrySort.dir === "asc" ? 1 : -1;
    if (countrySort.field === "name") return mul * a.country.localeCompare(b.country);
    if (countrySort.field === "revenue") return mul * (a.revenue - b.revenue);
    return mul * (a.count - b.count);
  });

  const sortedTech = [...data.topTechnologies].sort((a, b) => {
    const mul = techSort.dir === "asc" ? 1 : -1;
    if (techSort.field === "name") return mul * a.tech.localeCompare(b.tech);
    return mul * (a.count - b.count);
  });

  const sortedPlatforms = [...data.platformBreakdown].sort((a, b) => {
    const mul = platformSort.dir === "asc" ? 1 : -1;
    if (platformSort.field === "name") return mul * a.platform.localeCompare(b.platform);
    return mul * (a.leads - b.leads);
  });

  const displayedCountries = showAllCountries ? sortedCountries : sortedCountries.slice(0, 3);
  const displayedTech = showAllTech ? sortedTech : sortedTech.slice(0, 3);
  const displayedPlatforms = showAllPlatforms ? sortedPlatforms : sortedPlatforms.slice(0, 4);
  const displayedAgents = showAllAgents ? data.agentPerformance : data.agentPerformance.slice(0, 3);

  const kpis = [
    { label: "Total Leads", value: formatNumber(data.totalLeads), trend: "+12.5%", up: true, icon: Target, color: "text-cyan-400", glow: "bg-cyan-500/10" },
    { label: "Total Proposals", value: data.totalProposals, trend: "+8.2%", up: true, icon: FileText, color: "text-violet-400", glow: "bg-violet-500/10" },
    { label: "Win Rate", value: `${data.winRate}%`, trend: "+3.1%", up: true, icon: TrendingUp, color: "text-emerald-400", glow: "bg-emerald-500/10" },
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue), trend: "+18.7%", up: true, icon: DollarSign, color: "text-amber-400", glow: "bg-amber-500/10" },
    { label: "Avg Deal Size", value: formatCurrency(data.avgDealSize), trend: "-2.3%", up: false, icon: Briefcase, color: "text-rose-400", glow: "bg-rose-500/10" },
    { label: "Conversion Rate", value: `${data.conversionRate}%`, trend: "+5.4%", up: true, icon: Zap, color: "text-blue-400", glow: "bg-blue-500/10" },
  ];

  function SortButton({ label, field, current, onToggle }: { label: string; field: SortField; current: { field: SortField; dir: SortDir }; onToggle: () => void }) {
    const active = current.field === field;
    return (
      <button
        onClick={onToggle}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors shrink-0",
          active ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
        )}
      >
        {label}
        <ArrowUpDown className={cn("w-3 h-3", active && "text-violet-400")} />
      </button>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0">
                <BarChart3 className="w-6 h-6 text-violet-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate">
                  Analytics
                </h1>
                <p className="text-sm text-zinc-500 truncate">AI-powered business intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {/* Period selector buttons */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPeriod(p.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                      selectedPeriod === p.value
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                className="border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi, i) => (
              <Card
                key={kpi.label}
                className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300 overflow-hidden relative"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Decorative gradient overlay */}
                <div className={cn("absolute inset-0 opacity-30 pointer-events-none", kpi.glow)} />
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2 rounded-lg shrink-0", kpi.glow)}>
                      <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                    </div>
                    <span className={cn(
                      "flex items-center gap-0.5 text-xs font-medium shrink-0",
                      kpi.up ? "text-emerald-400" : "text-rose-400"
                    )}>
                      <ArrowUpRight className={cn("w-3 h-3", !kpi.up && "rotate-90")} />
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white truncate">{kpi.value}</p>
                  <p className="text-xs text-zinc-500 mt-1 truncate">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900/80 border border-zinc-800/80 p-1 h-auto">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <DollarSign className="w-4 h-4 mr-1.5 shrink-0" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="countries" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-1.5 shrink-0" />
                Countries
              </TabsTrigger>
              <TabsTrigger value="technologies" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Layers className="w-4 h-4 mr-1.5 shrink-0" />
                Technologies
              </TabsTrigger>
              <TabsTrigger value="platforms" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-1.5 shrink-0" />
                Platforms
              </TabsTrigger>
              <TabsTrigger value="ai-agents" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-1.5 shrink-0" />
                AI Agents
              </TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="mt-4 space-y-6">
              {/* Monthly Revenue */}
              <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                    <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="truncate">Monthly Revenue</span>
                  </CardTitle>
                  <CardDescription className="truncate">Revenue breakdown over the selected period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 overflow-hidden">
                  {isRefreshing ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                  ) : (
                    filteredMonthlyRevenue.map((month, i) => (
                      <div
                        key={month.month}
                        className="flex items-center gap-4 group"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <span className="text-sm text-zinc-500 w-10 shrink-0 font-mono">{month.month}</span>
                        <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative min-w-0">
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-emerald-600/80 to-emerald-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:from-emerald-500/80 group-hover:to-emerald-300/80 pointer-events-none"
                            style={{ width: `${(month.revenue / maxMonthlyRevenue) * 100}%`, minWidth: "60px" }}
                          >
                            <span className="text-xs font-semibold text-white drop-shadow-lg">
                              {formatCurrency(month.revenue)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-600 shrink-0 w-16 text-right">{month.proposals} props</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Industry Trends */}
              <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                    <TrendingUp className="w-5 h-5 text-violet-400 shrink-0" />
                    <span className="truncate">Industry Trends</span>
                  </CardTitle>
                  <CardDescription className="truncate">Growth rates across key industry sectors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 overflow-hidden">
                  {data.industryTrends.map((trend, i) => (
                    <div key={trend.industry} style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center justify-between mb-2 min-w-0">
                        <span className="text-sm text-zinc-300 truncate min-w-0">{trend.industry}</span>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className="text-xs text-zinc-500">{trend.opportunities} opps</span>
                          <span className={cn(
                            "text-sm font-semibold",
                            trend.growth >= 0 ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {trend.growth >= 0 ? "+" : ""}{trend.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600/80 to-violet-400/80 transition-all duration-700 ease-out pointer-events-none"
                          style={{ width: `${Math.min(Math.abs(trend.growth) * 3, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Countries Tab */}
            <TabsContent value="countries" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                      <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span className="truncate">Leads by Country</span>
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <SortButton label="Count" field="count" current={countrySort} onToggle={() => toggleSort(countrySort, setCountrySort, "count")} />
                      <SortButton label="Revenue" field="revenue" current={countrySort} onToggle={() => toggleSort(countrySort, setCountrySort, "revenue")} />
                      <SortButton label="Name" field="name" current={countrySort} onToggle={() => toggleSort(countrySort, setCountrySort, "name")} />
                    </div>
                  </div>
                  <CardDescription className="truncate">Geographic distribution of your leads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 overflow-hidden">
                  {displayedCountries.map((country, i) => {
                    const maxCount = Math.max(...data.topCountries.map((c) => c.count));
                    return (
                      <div
                        key={country.country}
                        className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors overflow-hidden"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-lg font-bold text-zinc-600 w-6 text-right shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5 min-w-0">
                            <span className="text-sm font-medium text-white truncate min-w-0">{country.country}</span>
                            <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span className="text-xs text-zinc-500">{country.count} leads</span>
                              <span className="text-xs font-semibold text-emerald-400">{formatCurrency(country.revenue)}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-600/80 to-cyan-400/80 transition-all duration-700 ease-out pointer-events-none"
                              style={{ width: `${(country.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {data.topCountries.length > 3 && (
                    <button
                      onClick={() => setShowAllCountries(!showAllCountries)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40"
                    >
                      {showAllCountries ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>See All ({data.topCountries.length}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technologies Tab */}
            <TabsContent value="technologies" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                      <Layers className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="truncate">Leads by Technology</span>
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <SortButton label="Count" field="count" current={techSort} onToggle={() => toggleSort(techSort, setTechSort, "count")} />
                      <SortButton label="Name" field="name" current={techSort} onToggle={() => toggleSort(techSort, setTechSort, "name")} />
                    </div>
                  </div>
                  <CardDescription className="truncate">Technology stack preferences across your pipeline</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedTech.map((tech, i) => {
                      const maxCount = Math.max(...data.topTechnologies.map((t) => t.count));
                      return (
                        <div
                          key={tech.tech}
                          className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300 overflow-hidden"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                              #{i + 1}
                            </span>
                            <span className="text-sm font-semibold text-white truncate min-w-0">{tech.tech}</span>
                          </div>
                          <p className="text-2xl font-bold text-white mb-2">{tech.count}</p>
                          <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-600/80 to-amber-400/80 transition-all duration-700 ease-out pointer-events-none"
                              style={{ width: `${(tech.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {data.topTechnologies.length > 3 && (
                    <button
                      onClick={() => setShowAllTech(!showAllTech)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40 mt-3"
                    >
                      {showAllTech ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>See All ({data.topTechnologies.length}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                      <Zap className="w-5 h-5 text-blue-400 shrink-0" />
                      <span className="truncate">Leads by Platform</span>
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <SortButton label="Count" field="count" current={platformSort} onToggle={() => toggleSort(platformSort, setPlatformSort, "count")} />
                      <SortButton label="Name" field="name" current={platformSort} onToggle={() => toggleSort(platformSort, setPlatformSort, "name")} />
                    </div>
                  </div>
                  <CardDescription className="truncate">Platform distribution across your lead sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 overflow-hidden">
                  {displayedPlatforms.map((platform, i) => {
                    const maxCount = Math.max(...data.platformBreakdown.map((p) => p.leads));
                    return (
                      <div
                        key={platform.platform}
                        className="flex items-center gap-4 overflow-hidden"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-sm font-medium text-zinc-300 w-28 shrink-0 truncate">{platform.platform}</span>
                        <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative min-w-0">
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-blue-600/80 to-blue-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3 pointer-events-none"
                            style={{ width: `${(platform.leads / maxCount) * 100}%`, minWidth: "40px" }}
                          >
                            <span className="text-xs font-semibold text-white drop-shadow-lg">{platform.leads}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {data.platformBreakdown.length > 4 && (
                    <button
                      onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40"
                    >
                      {showAllPlatforms ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>See All ({data.platformBreakdown.length}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Agents Tab */}
            <TabsContent value="ai-agents" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                    <Brain className="w-5 h-5 text-violet-400 shrink-0" />
                    <span className="truncate">AI Agent Performance</span>
                  </CardTitle>
                  <CardDescription className="truncate">Performance metrics for your AI-powered agents</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedAgents.map((agent, i) => (
                      <div
                        key={agent.agent}
                        className="p-5 rounded-xl bg-zinc-800/20 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300 group overflow-hidden relative"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none" />
                        <div className="flex items-center gap-3 mb-4 min-w-0 relative">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-all shrink-0">
                            <Brain className="w-5 h-5 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{agent.agent}</h4>
                            <p className="text-xs text-zinc-500 truncate">{agent.tasks} tasks completed</p>
                          </div>
                        </div>
                        <div className="space-y-3 relative">
                          <div>
                            <div className="flex items-center justify-between mb-1.5 min-w-0">
                              <span className="text-xs text-zinc-500 shrink-0">Efficiency</span>
                              <span className="text-xs font-semibold text-violet-400 shrink-0">{agent.efficiency}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-600/80 to-purple-400/80 transition-all duration-700 ease-out pointer-events-none"
                                style={{ width: `${agent.efficiency}%` }}
                              />
                            </div>
                          </div>
                          <div className="pt-1">
                            <div className="p-2 rounded-lg bg-zinc-800/30 overflow-hidden">
                              <p className="text-lg font-bold text-white">{agent.tasks}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tasks</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.agentPerformance.length > 3 && (
                    <button
                      onClick={() => setShowAllAgents(!showAllAgents)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40 mt-4"
                    >
                      {showAllAgents ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>See All ({data.agentPerformance.length}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
