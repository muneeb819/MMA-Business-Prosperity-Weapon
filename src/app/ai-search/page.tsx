"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency, timeAgo, cn } from "@/lib/utils"
import { mockLeads } from "@/lib/mock-data"
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
  Star,
  History,
  Bookmark,
} from "lucide-react"

const suggestedQueries = [
  "Find React projects over $10,000",
  "Find remote QA jobs in Europe",
  "Find sales opportunities in USA",
  "Find AI/ML projects for startups",
  "Find government tenders in cloud computing",
  "Find UI/UX design gigs under $5,000",
  "Find database admin jobs in finance",
  "Find DevOps contracts in Germany",
]

const recentSearches = [
  { query: "React developer jobs remote $15K+", results: 23, time: "1h ago" },
  { query: "AI chatbot projects enterprise", results: 12, time: "3h ago" },
  { query: "Cloud migration contracts USA", results: 8, time: "5h ago" },
  { query: "QA automation freelance Europe", results: 15, time: "1d ago" },
]

export default function AISearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof mockLeads>([])

  const handleSearch = () => {
    if (!query.trim()) return
    setIsSearching(true)
    setTimeout(() => {
      setSearchResults(mockLeads.slice(0, Math.floor(Math.random() * 5) + 3))
      setIsSearching(false)
    }, 2000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              AI Search Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              Use natural language to find exactly what you need across the internet
            </p>
          </div>

          {/* Search Bar */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Brain className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    placeholder="Describe what you're looking for in natural language..."
                    className="pl-12 h-14 text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-3">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="full_time">Full Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Budget</SelectItem>
                        <SelectItem value="low">Under $5K</SelectItem>
                        <SelectItem value="mid">$5K - $25K</SelectItem>
                        <SelectItem value="high">$25K - $100K</SelectItem>
                        <SelectItem value="enterprise">$100K+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> AI Search</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {isSearching ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                        <Brain className="h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">AI is searching the web...</h3>
                        <p className="text-sm text-muted-foreground mt-1">Scanning multiple platforms and analyzing results</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing opportunities across 20+ platforms...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{searchResults.length} results found for &quot;{query}&quot;</p>
                    <Select defaultValue="relevance">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="success">Success Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {searchResults.map((lead) => (
                    <Card key={lead.id} className="hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                            <Target className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold group-hover:text-primary transition-colors">{lead.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{lead.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.company}</span>
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.country}</span>
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatCurrency(lead.budget.min)}-{formatCurrency(lead.budget.max)}</span>
                              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{lead.successProbability}%</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              {lead.technologies.slice(0, 4).map(tech => (
                                <Badge key={tech} variant="secondary" className="text-[9px]">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Search the Web with AI</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                      Type your query in natural language and let AI find the best opportunities across the internet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Suggested Queries */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Suggested Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedQueries.map((sq, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors text-sm flex items-center gap-2"
                        onClick={() => { setQuery(sq); }}
                      >
                        <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                        {sq}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Searches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentSearches.map((rs, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                        <p className="text-sm font-medium">{rs.query}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{rs.results} results</span>
                          <span>·</span>
                          <span>{rs.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
