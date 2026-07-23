"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { mockAnalytics } from "@/lib/mock-data";
import {
  BarChart3, TrendingUp, DollarSign, Target, Globe, Zap, Download,
  Layers, Brain, ArrowUpRight, Briefcase, FileText,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12m");
  const [activeTab, setActiveTab] = useState("revenue");

  const { monthlyRevenue, topCountries, topTechnologies, platformBreakdown, agentPerformance, industryTrends } = mockAnalytics;

  const totalLeads = topCountries.reduce((a, c) => a + c.count, 0);
  const totalProposals = 47;
  const winRate = 68;
  const totalRevenue = monthlyRevenue.reduce((a, m) => a + m.revenue, 0);
  const avgDealSize = totalRevenue / totalProposals;
  const conversionRate = 24;

  const kpis = [
    { label: "Total Leads", value: formatNumber(totalLeads), trend: "+12.5%", up: true, icon: Target, color: "text-cyan-400", glow: "bg-cyan-500/10" },
    { label: "Total Proposals", value: totalProposals, trend: "+8.2%", up: true, icon: FileText, color: "text-violet-400", glow: "bg-violet-500/10" },
    { label: "Win Rate", value: `${winRate}%`, trend: "+3.1%", up: true, icon: TrendingUp, color: "text-emerald-400", glow: "bg-emerald-500/10" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), trend: "+18.7%", up: true, icon: DollarSign, color: "text-amber-400", glow: "bg-amber-500/10" },
    { label: "Avg Deal Size", value: formatCurrency(avgDealSize), trend: "-2.3%", up: false, icon: Briefcase, color: "text-rose-400", glow: "bg-rose-500/10" },
    { label: "Conversion Rate", value: `${conversionRate}%`, trend: "+5.4%", up: true, icon: Zap, color: "text-blue-400", glow: "bg-blue-500/10" },
  ];

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <BarChart3 className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Analytics
                </h1>
                <p className="text-sm text-zinc-500">AI-powered business intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] bg-zinc-900/60 border-zinc-800/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800">
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
                className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2 rounded-lg", kpi.glow)}>
                      <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                    </div>
                    <span className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      kpi.up ? "text-emerald-400" : "text-rose-400"
                    )}>
                      <ArrowUpRight className={cn("w-3 h-3", !kpi.up && "rotate-90")} />
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white">{kpi.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{kpi.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900/80 border border-zinc-800/80 p-1 h-auto">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <DollarSign className="w-4 h-4 mr-1.5" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="countries" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-1.5" />
                Countries
              </TabsTrigger>
              <TabsTrigger value="technologies" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Layers className="w-4 h-4 mr-1.5" />
                Technologies
              </TabsTrigger>
              <TabsTrigger value="platforms" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-1.5" />
                Platforms
              </TabsTrigger>
              <TabsTrigger value="ai-agents" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-1.5" />
                AI Agents
              </TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="mt-4 space-y-6">
              {/* Monthly Revenue */}
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Monthly Revenue
                  </CardTitle>
                  <CardDescription>Revenue breakdown over the selected period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monthlyRevenue.map((month, i) => (
                    <div
                      key={month.month}
                      className="flex items-center gap-4 group"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <span className="text-sm text-zinc-500 w-10 shrink-0 font-mono">{month.month}</span>
                      <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg bg-gradient-to-r from-emerald-600/80 to-emerald-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:from-emerald-500/80 group-hover:to-emerald-300/80"
                          style={{ width: `${(month.revenue / maxMonthlyRevenue) * 100}%`, minWidth: "60px" }}
                        >
                          <span className="text-xs font-semibold text-white drop-shadow-lg">
                            {formatCurrency(month.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Industry Trends */}
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    Industry Trends
                  </CardTitle>
                  <CardDescription>Growth rates across key industry sectors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {industryTrends.map((trend, i) => (
                    <div key={trend.industry} style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-300">{trend.industry}</span>
                        <span className={cn(
                          "text-sm font-semibold",
                          trend.growth >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {trend.growth >= 0 ? "+" : ""}{trend.growth}%
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600/80 to-violet-400/80 transition-all duration-700 ease-out"
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
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Leads by Country
                  </CardTitle>
                  <CardDescription>Geographic distribution of your leads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...topCountries].sort((a, b) => b.count - a.count).map((country, i) => {
                    const maxCount = Math.max(...topCountries.map((c) => c.count));
                    return (
                      <div
                        key={country.country}
                        className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-lg font-bold text-zinc-600 w-6 text-right">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-white">{country.country}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-zinc-500">{country.count} leads</span>
                              <span className="text-xs font-semibold text-emerald-400">{formatCurrency(country.revenue)}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-600/80 to-cyan-400/80 transition-all duration-700 ease-out"
                              style={{ width: `${(country.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technologies Tab */}
            <TabsContent value="technologies" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    Leads by Technology
                  </CardTitle>
                  <CardDescription>Technology stack preferences across your pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...topTechnologies].sort((a, b) => b.count - a.count).map((tech, i) => {
                      const maxCount = Math.max(...topTechnologies.map((t) => t.count));
                      return (
                        <div
                          key={tech.tech}
                          className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                              #{i + 1}
                            </span>
                            <span className="text-sm font-semibold text-white">{tech.tech}</span>
                          </div>
                          <p className="text-2xl font-bold text-white mb-2">{tech.count}</p>
                          <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-600/80 to-amber-400/80 transition-all duration-700 ease-out"
                              style={{ width: `${(tech.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    Leads by Platform
                  </CardTitle>
                  <CardDescription>Platform distribution across your lead sources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...platformBreakdown].sort((a, b) => b.leads - a.leads).map((platform, i) => {
                    const maxCount = Math.max(...platformBreakdown.map((p) => p.leads));
                    return (
                      <div
                        key={platform.platform}
                        className="flex items-center gap-4"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-sm font-medium text-zinc-300 w-28 shrink-0">{platform.platform}</span>
                        <div className="flex-1 h-8 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                          <div
                            className="h-full rounded-lg bg-gradient-to-r from-blue-600/80 to-blue-400/80 transition-all duration-700 ease-out flex items-center justify-end pr-3"
                            style={{ width: `${(platform.leads / maxCount) * 100}%`, minWidth: "40px" }}
                          >
                            <span className="text-xs font-semibold text-white drop-shadow-lg">{platform.leads}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Agents Tab */}
            <TabsContent value="ai-agents" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    AI Agent Performance
                  </CardTitle>
                  <CardDescription>Performance metrics for your AI-powered agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agentPerformance.map((agent, i) => (
                      <div
                        key={agent.agent}
                        className="p-5 rounded-xl bg-zinc-800/20 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300 group"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-all">
                            <Brain className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{agent.agent}</h4>
                            <p className="text-xs text-zinc-500">{agent.tasks} tasks completed</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-zinc-500">Efficiency</span>
                              <span className="text-xs font-semibold text-violet-400">{agent.efficiency}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-600/80 to-purple-400/80 transition-all duration-700 ease-out"
                                style={{ width: `${agent.efficiency}%` }}
                              />
                            </div>
                          </div>
                          <div className="pt-1">
                            <div className="p-2 rounded-lg bg-zinc-800/30">
                              <p className="text-lg font-bold text-white">{agent.tasks}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tasks</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
