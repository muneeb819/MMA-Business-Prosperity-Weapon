"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatNumber, cn } from "@/lib/utils"
import { mockAnalytics } from "@/lib/mock-data"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Globe,
  Users,
  Zap,
  Download,
  Calendar,
  PieChart,
  Activity,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Briefcase,
  FileText,
  Layers,
} from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12m")
  const data = mockAnalytics

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive business intelligence and performance analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="12m">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export Report
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+12%</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data.totalLeads)}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+8%</span>
                </div>
                <p className="text-2xl font-bold">{data.totalProposals}</p>
                <p className="text-xs text-muted-foreground">Total Proposals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+2.1%</span>
                </div>
                <p className="text-2xl font-bold">{data.winRate}%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+18%</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+5%</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(data.avgDealSize)}</p>
                <p className="text-xs text-muted-foreground">Avg Deal Size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+3%</span>
                </div>
                <p className="text-2xl font-bold">{data.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="technologies">Technologies</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="agents">AI Agents</TabsTrigger>
            </TabsList>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.monthlyRevenue.map((month) => {
                        const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue))
                        return (
                          <div key={month.month} className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground w-8 font-medium">{month.month}</span>
                            <div className="flex-1 h-8 bg-muted/50 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg transition-all duration-700 flex items-center justify-end px-3"
                                style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                              >
                                <span className="text-xs font-semibold text-white whitespace-nowrap">
                                  {formatCurrency(month.revenue)}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground w-16 text-right">{month.proposals} proposals</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Industry Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.industryTrends.map((trend) => (
                        <div key={trend.industry} className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{trend.industry}</span>
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                                <TrendingUp className="h-3 w-3" />+{trend.growth}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                style={{ width: `${(trend.growth / 40) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-20 text-right">{trend.opportunities} opps</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Countries Tab */}
            <TabsContent value="countries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> Top Countries
                  </CardTitle>
                  <CardDescription>Revenue and lead distribution by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topCountries.map((country, idx) => {
                      const maxCount = Math.max(...data.topCountries.map(c => c.count))
                      return (
                        <div key={country.country} className="flex items-center gap-4">
                          <span className="text-sm font-bold text-muted-foreground w-6">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{country.country}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground">{country.count} leads</span>
                                <span className="text-sm font-semibold text-emerald-600">{formatCurrency(country.revenue)}</span>
                              </div>
                            </div>
                            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                style={{ width: `${(country.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technologies Tab */}
            <TabsContent value="technologies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Top Technologies
                  </CardTitle>
                  <CardDescription>Most in-demand technologies in your leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.topTechnologies.map((tech, idx) => {
                      const maxCount = Math.max(...data.topTechnologies.map(t => t.count))
                      return (
                        <Card key={tech.tech} className="hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                #{idx + 1}
                              </div>
                              <span className="font-semibold">{tech.tech}</span>
                            </div>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold">{tech.count}</span>
                              <span className="text-xs text-muted-foreground">leads</span>
                            </div>
                            <div className="h-1.5 bg-muted/50 rounded-full mt-3 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                style={{ width: `${(tech.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Platform Breakdown
                  </CardTitle>
                  <CardDescription>Leads discovered from each platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.platformBreakdown.map((platform) => {
                      const maxLeads = Math.max(...data.platformBreakdown.map(p => p.leads))
                      return (
                        <div key={platform.platform} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-32">{platform.platform}</span>
                          <div className="flex-1 h-8 bg-muted/50 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-end px-3 transition-all duration-500"
                              style={{ width: `${(platform.leads / maxLeads) * 100}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{platform.leads}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> AI Agent Performance
                  </CardTitle>
                  <CardDescription>Efficiency and task completion metrics for each AI agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.agentPerformance.map((agent) => (
                      <div key={agent.agent} className="p-5 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{agent.agent}</h4>
                            <p className="text-xs text-muted-foreground">Active agent</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Efficiency</span>
                              <span className="text-xs font-semibold">{agent.efficiency}%</span>
                            </div>
                            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                style={{ width: `${agent.efficiency}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Tasks Completed</span>
                            <span className="text-sm font-bold">{formatNumber(agent.tasks)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
