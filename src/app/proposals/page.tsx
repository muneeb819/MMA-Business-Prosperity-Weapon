"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, timeAgo, cn } from "@/lib/utils"
import { mockProposals, mockLeads } from "@/lib/mock-data"
import { Proposal } from "@/lib/types"
import {
  FileText,
  Send,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Brain,
  Sparkles,
  Copy,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  PenTool,
  ArrowRight,
  Plus,
  Filter,
  Search,
} from "lucide-react"

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  draft: { color: "bg-gray-500/10 text-gray-600", icon: <Edit3 className="h-3 w-3" />, label: "Draft" },
  review: { color: "bg-amber-500/10 text-amber-600", icon: <Eye className="h-3 w-3" />, label: "In Review" },
  submitted: { color: "bg-blue-500/10 text-blue-600", icon: <Send className="h-3 w-3" />, label: "Submitted" },
  accepted: { color: "bg-emerald-500/10 text-emerald-600", icon: <CheckCircle2 className="h-3 w-3" />, label: "Accepted" },
  rejected: { color: "bg-red-500/10 text-red-600", icon: <AlertCircle className="h-3 w-3" />, label: "Rejected" },
}

export default function ProposalsPage() {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [generatorLead, setGeneratorLead] = useState("")
  const [generatorTone, setGeneratorTone] = useState("professional")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Proposals
              </h1>
              <p className="text-muted-foreground mt-1">
                {mockProposals.length} total proposals · {mockProposals.filter(p => p.status === "draft").length} drafts · {mockProposals.filter(p => p.status === "submitted").length} submitted
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm" onClick={() => setShowGenerator(true)}>
                <Sparkles className="h-4 w-4 mr-2" /> AI Generate Proposal
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{mockProposals.filter(p => p.status === "draft").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Drafts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{mockProposals.filter(p => p.status === "submitted").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Submitted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{mockProposals.filter(p => p.status === "accepted").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Accepted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{mockProposals.length > 0 ? Math.round(mockProposals.reduce((a, p) => a + p.winProbability, 0) / mockProposals.length) : 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Win Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Proposals List */}
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4">
              {mockProposals.map((proposal) => {
                const lead = mockLeads.find(l => l.id === proposal.leadId)
                const config = statusConfig[proposal.status]
                return (
                  <Card key={proposal.id} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedProposal(proposal)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center shrink-0">
                          <FileText className="h-7 w-7 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">{proposal.title}</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                For: {lead?.company || "Unknown"} · {lead?.clientName || "Unknown"}
                              </p>
                            </div>
                            <Badge variant="outline" className={cn("text-[10px] gap-1 shrink-0", config.color)}>
                              {config.icon}
                              {config.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-5 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />{lead ? formatCurrency(lead.budget.min) + " - " + formatCurrency(lead.budget.max) : "N/A"}</span>
                            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />{proposal.winProbability}% win probability</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Created {timeAgo(new Date(proposal.createdAt))}</span>
                            {proposal.submittedAt && (
                              <span className="flex items-center gap-1.5"><Send className="h-3.5 w-3.5" />Submitted {timeAgo(new Date(proposal.submittedAt))}</span>
                            )}
                          </div>

                          <div className="mt-3">
                            <Progress value={proposal.winProbability} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>

          {/* Proposal Detail Dialog */}
          <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedProposal && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{selectedProposal.title}</DialogTitle>
                    <DialogDescription>
                      {mockLeads.find(l => l.id === selectedProposal.leadId)?.company} · Created {timeAgo(new Date(selectedProposal.createdAt))}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("gap-1", statusConfig[selectedProposal.status].color)}>
                        {statusConfig[selectedProposal.status].icon}
                        {statusConfig[selectedProposal.status].label}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Win Probability:</span>
                        <Progress value={selectedProposal.winProbability} className="h-3 w-24" />
                        <span className="text-sm font-bold">{selectedProposal.winProbability}%</span>
                      </div>
                    </div>

                    <Tabs defaultValue="cover" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="cover">Cover Letter</TabsTrigger>
                        <TabsTrigger value="intro">Introduction</TabsTrigger>
                        <TabsTrigger value="technical">Technical Plan</TabsTrigger>
                        <TabsTrigger value="cost">Cost Estimate</TabsTrigger>
                        <TabsTrigger value="cta">Call to Action</TabsTrigger>
                      </TabsList>

                      <TabsContent value="cover">
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose prose-sm max-w-none">
                              {selectedProposal.coverLetter.split("\n\n").map((para, i) => (
                                <p key={i} className="text-sm leading-relaxed mb-3 whitespace-pre-line">{para}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="intro">
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose prose-sm max-w-none">
                              {selectedProposal.introduction.split("\n\n").map((para, i) => (
                                <p key={i} className="text-sm leading-relaxed mb-3 whitespace-pre-line">{para}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="technical">
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose prose-sm max-w-none">
                              {selectedProposal.technicalPlan.split("\n\n").map((para, i) => (
                                <p key={i} className="text-sm leading-relaxed mb-3 whitespace-pre-line">{para}</p>
                              ))}
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <p className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Timeline: {selectedProposal.timeline}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="cost">
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose prose-sm max-w-none">
                              {selectedProposal.costEstimate.split("\n").map((line, i) => (
                                <p key={i} className="text-sm leading-relaxed mb-1 whitespace-pre-line">{line}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="cta">
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose prose-sm max-w-none">
                              {selectedProposal.callToAction.split("\n\n").map((para, i) => (
                                <p key={i} className="text-sm leading-relaxed mb-3 whitespace-pre-line">{para}</p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Portfolio Suggestions */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Portfolio Suggestions
                      </h4>
                      <div className="space-y-2">
                        {selectedProposal.portfolioSuggestions.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button><Send className="h-4 w-4 mr-2" /> Submit Proposal</Button>
                      <Button variant="outline"><Edit3 className="h-4 w-4 mr-2" /> Edit</Button>
                      <Button variant="outline"><Copy className="h-4 w-4 mr-2" /> Duplicate</Button>
                      <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* AI Generator Dialog */}
          <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> AI Proposal Generator
                </DialogTitle>
                <DialogDescription>
                  Let AI create a customized proposal for any lead
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Lead</label>
                  <select className="w-full p-2.5 rounded-lg border bg-background text-sm">
                    <option value="">Choose a lead...</option>
                    {mockLeads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.title} - {lead.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tone</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Professional", "Friendly", "Confident"].map(tone => (
                      <div key={tone} className={cn(
                        "p-3 rounded-lg border text-center cursor-pointer transition-all text-sm",
                        generatorTone === tone.toLowerCase() ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      )} onClick={() => setGeneratorTone(tone.toLowerCase())}>
                        {tone}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Additional Instructions</label>
                  <Textarea placeholder="Any specific requirements or focus areas for the proposal..." rows={3} />
                </div>
                <Button className="w-full" onClick={() => setShowGenerator(false)}>
                  <Brain className="h-4 w-4 mr-2" /> Generate Proposal with AI
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
