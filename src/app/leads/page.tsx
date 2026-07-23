"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency, timeAgo, cn } from "@/lib/utils"
import { mockLeads } from "@/lib/mock-data"
import { Lead } from "@/lib/types"
import {
  Target,
  Search,
  Filter,
  Eye,
  FileText,
  Globe,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Zap,
  BarChart3,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  Brain,
  Briefcase,
  Star,
  Layers,
  Tag,
} from "lucide-react"

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  analyzing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  qualified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  proposal_sent: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  negotiation: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  won: "bg-green-500/10 text-green-600 border-green-500/20",
  lost: "bg-red-500/10 text-red-600 border-red-500/20",
  archived: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const urgencyColors: Record<string, string> = {
  critical: "destructive",
  high: "warning",
  medium: "info",
  low: "secondary",
}

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeads = mockLeads.filter(lead => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false
    if (urgencyFilter !== "all" && lead.urgency !== urgencyFilter) return false
    if (searchQuery && !lead.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !lead.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !lead.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Leads
              </h1>
              <p className="text-muted-foreground mt-1">
                {mockLeads.length} total leads · {mockLeads.filter(l => l.status === "new").length} new · {mockLeads.filter(l => l.status === "qualified").length} qualified
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Advanced Filters
              </Button>
              <Button size="sm">
                <Sparkles className="h-4 w-4 mr-2" /> Analyze All New
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["new", "analyzing", "qualified", "proposal_sent", "won"].map(status => {
              const count = mockLeads.filter(l => l.status === status).length
              return (
                <Card key={status} className="cursor-pointer hover:shadow-md transition-all" onClick={() => setStatusFilter(status)}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{status.replace("_", " ")}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by title, company, client..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedLead(lead)}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">{lead.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{lead.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={urgencyColors[lead.urgency] as BadgeProps["variant"]} className="text-[10px]">
                              {lead.urgency}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px]", statusColors[lead.status])}>
                              {lead.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{lead.company}</span>
                          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{lead.clientName}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{lead.country}</span>
                          <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />{formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{timeAgo(new Date(lead.foundAt))}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {lead.technologies.slice(0, 5).map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-[10px]">{tech}</Badge>
                            ))}
                            {lead.technologies.length > 5 && (
                              <Badge variant="secondary" className="text-[10px]">+{lead.technologies.length - 5}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium">{lead.successProbability}% success</span>
                            </div>
                            <span className="text-sm font-semibold text-emerald-600">
                              {formatCurrency(lead.expectedRevenue)} expected
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Lead Detail Dialog */}
          <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              {selectedLead && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{selectedLead.title}</DialogTitle>
                    <DialogDescription>{selectedLead.company} · {selectedLead.clientName}</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {/* Status & Urgency */}
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(statusColors[selectedLead.status])}>
                        {selectedLead.status.replace("_", " ")}
                      </Badge>
                      <Badge variant={urgencyColors[selectedLead.urgency] as BadgeProps["variant"]}>
                        {selectedLead.urgency} urgency
                      </Badge>
                      <Badge variant="outline">{selectedLead.projectSize}</Badge>
                      <Badge variant="outline">{selectedLead.jobType}</Badge>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedLead.description}</p>
                    </div>

                    {/* Client Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Client Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{selectedLead.clientName}</div>
                          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />{selectedLead.company}</div>
                          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{selectedLead.email}</div>
                          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{selectedLead.phone}</div>
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{selectedLead.country}</div>
                          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{selectedLead.platform}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold">Project Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />{formatCurrency(selectedLead.budget.min)} - {formatCurrency(selectedLead.budget.max)}</div>
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Deadline: {selectedLead.deadline}</div>
                          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" />Payment: {selectedLead.paymentMethod}</div>
                          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />Competition: {selectedLead.competition} bidders</div>
                          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" />Expected Revenue: {formatCurrency(selectedLead.expectedRevenue)}</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" /> AI Analysis
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-xl bg-muted/30 text-center">
                          <p className="text-2xl font-bold text-emerald-600">{selectedLead.successProbability}%</p>
                          <p className="text-xs text-muted-foreground">Success Probability</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 text-center">
                          <p className="text-2xl font-bold">{selectedLead.difficulty}%</p>
                          <p className="text-xs text-muted-foreground">Difficulty Score</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30 text-center">
                          <p className="text-2xl font-bold">{selectedLead.riskLevel}</p>
                          <p className="text-xs text-muted-foreground">Risk Level</p>
                        </div>
                      </div>
                    </div>

                    {/* Technologies & Skills */}
                    <div>
                      <h4 className="font-semibold mb-2">Required Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.technologies.map(tech => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.skills.map(skill => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedLead.notes && (
                      <div>
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{selectedLead.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button><FileText className="h-4 w-4 mr-2" /> Generate Proposal</Button>
                      <Button variant="outline"><Mail className="h-4 w-4 mr-2" /> Send Email</Button>
                      <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" /> View Original</Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
