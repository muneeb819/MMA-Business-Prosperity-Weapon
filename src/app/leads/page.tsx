"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { mockLeads } from "@/lib/mock-data";
import type { Lead } from "@/lib/types";
import {
  Search,
  Filter,
  Users,
  TrendingUp,
  Zap,
  Target,
  CheckCircle2,
  Send,
  FileText,
  Eye,
  Clock,
  AlertTriangle,
  Globe,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  X,
  ArrowUpRight,
  Briefcase,
  MapPin,
  Cpu,
  Layers,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: <Zap className="w-3.5 h-3.5" /> },
  analyzing: { label: "Analyzing", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <Brain className="w-3.5 h-3.5" /> },
  qualified: { label: "Qualified", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  proposal_sent: { label: "Proposal Sent", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: <Send className="w-3.5 h-3.5" /> },
  won: { label: "Won", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: <Target className="w-3.5 h-3.5" /> },
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
  medium: { label: "Medium", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  high: { label: "High", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  critical: { label: "Critical", color: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const statusSummaryCards = [
  { key: "new", icon: <Zap className="w-5 h-5" />, color: "from-blue-500 to-blue-600", glow: "shadow-blue-500/25" },
  { key: "analyzing", icon: <Brain className="w-5 h-5" />, color: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25" },
  { key: "qualified", icon: <CheckCircle2 className="w-5 h-5" />, color: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25" },
  { key: "proposal_sent", icon: <Send className="w-5 h-5" />, color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/25" },
  { key: "won", icon: <Target className="w-5 h-5" />, color: "from-cyan-500 to-teal-600", glow: "shadow-cyan-500/25" },
];

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return mockLeads.filter((lead) => {
      const matchesSearch =
        lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesUrgency = urgencyFilter === "all" || lead.urgency === urgencyFilter;
      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [searchQuery, statusFilter, urgencyFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { new: 0, analyzing: 0, qualified: 0, proposal_sent: 0, won: 0 };
    mockLeads.forEach((lead) => {
      if (counts[lead.status] !== undefined) counts[lead.status]++;
    });
    return counts;
  }, []);

  const totalBudget = useMemo(() => mockLeads.reduce((sum, l) => sum + (l.budget?.max || 0), 0), []);
  const avgProbability = useMemo(() => {
    const valid = mockLeads.filter((l) => l.successProbability);
    return valid.length ? Math.round(valid.reduce((sum, l) => sum + (l.successProbability || 0), 0) / valid.length) : 0;
  }, []);

  return (
    <div className="flex h-screen bg-[#07080F]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total Leads", value: mockLeads.length, icon: <Users className="w-5 h-5" />, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5 border-blue-500/20" },
              { label: "Total Pipeline", value: formatCurrency(totalBudget), icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20" },
              { label: "Avg. Win Probability", value: `${avgProbability}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-400", bg: "from-amber-500/10 to-amber-600/5 border-amber-500/20" },
              { label: "Conversion Rate", value: `${mockLeads.length ? Math.round((statusCounts.won / mockLeads.length) * 100) : 0}%`, icon: <Target className="w-5 h-5" />, color: "text-violet-400", bg: "from-violet-500/10 to-violet-600/5 border-violet-500/20" },
            ].map((stat, i) => (
              <Card key={i} className={cn("bg-gradient-to-br border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500", stat.bg)} style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl bg-gradient-to-br border", stat.bg)}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</p>
                    <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {statusSummaryCards.map((card, i) => {
              const cfg = statusConfig[card.key];
              return (
                <button
                  key={card.key}
                  onClick={() => setStatusFilter(statusFilter === card.key ? "all" : card.key)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-500",
                    statusFilter === card.key
                      ? "border-white/20 bg-white/[0.06] scale-[1.03]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  )}
                  style={{ animationDelay: `${400 + i * 60}ms` }}
                >
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br", card.color, "opacity-10")} />
                  <div className="relative flex items-center gap-2 mb-2">
                    <span className={cfg.color}>{cfg.icon}</span>
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
                  </div>
                  <p className="relative text-2xl font-bold text-white">{statusCounts[card.key]}</p>
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search leads by title, client, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-11"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-white/[0.03] border-white/[0.08] text-white h-11">
                <Filter className="w-4 h-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#12131C] border-white/10">
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-white/[0.03] border-white/[0.08] text-white h-11">
                <AlertTriangle className="w-4 h-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent className="bg-[#12131C] border-white/10">
                <SelectItem value="all">All Urgencies</SelectItem>
                {Object.entries(urgencyConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <p className="text-sm text-zinc-500">
              Showing <span className="text-white font-semibold">{filteredLeads.length}</span> of <span className="text-white font-semibold">{mockLeads.length}</span> leads
            </p>
            {(searchQuery || statusFilter !== "all" || urgencyFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); setUrgencyFilter("all"); }}
                className="text-zinc-500 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Lead Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
            {filteredLeads.map((lead, i) => {
              const sCfg = statusConfig[lead.status] || statusConfig.new;
              const uCfg = urgencyConfig[lead.urgency] || urgencyConfig.low;
              const prob = lead.successProbability || 0;

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="card-hover group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.05] transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 fill-mode-both"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="p-5">
                    {/* Top row: status + urgency + time */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5", sCfg.bg, sCfg.color)}>
                          {sCfg.icon}
                          <span className="ml-1">{sCfg.label}</span>
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5", uCfg.color)}>
                          {uCfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-600 text-[10px]">
                        <Clock className="w-3 h-3" />
                        {timeAgo(new Date(lead.foundAt))}
                      </div>
                    </div>

                    {/* Title + Company */}
                    <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {lead.title}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{lead.company}</span>
                      <span className="text-zinc-700">·</span>
                      <Users className="w-3.5 h-3.5" />
                      <span>{lead.clientName}</span>
                    </div>

                    {/* Country + Budget */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                        <Globe className="w-3.5 h-3.5" />
                        {lead.country || "Global"}
                      </div>
                      <div className="text-emerald-400 text-xs font-semibold">
                        {formatCurrency(lead.budget.min)} – {formatCurrency(lead.budget.max)}
                      </div>
                    </div>

                    {/* Success Probability Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Success Probability</span>
                        <span className={cn("text-xs font-bold", prob >= 70 ? "text-emerald-400" : prob >= 40 ? "text-amber-400" : "text-red-400")}>{prob}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", prob >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400" : prob >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400")}
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {(lead.technologies || []).slice(0, 4).map((tech) => (
                        <span key={tech} className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-0.5">
                          <Cpu className="w-2.5 h-2.5" />
                          {tech}
                        </span>
                      ))}
                      {(lead.technologies || []).length > 4 && (
                        <span className="text-[10px] text-zinc-600">+{lead.technologies.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                <Search className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-500 font-medium">No leads found</p>
              <p className="text-zinc-700 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Lead Detail Dialog */}
          <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
            <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-2xl max-h-[85vh] overflow-hidden p-0">
              {selectedLead && (
                <>
                  {/* Dialog Header */}
                  <div className="relative p-6 pb-4 border-b border-white/[0.06]">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-1", statusConfig[selectedLead.status]?.bg, statusConfig[selectedLead.status]?.color)}>
                          {statusConfig[selectedLead.status]?.icon}
                          <span className="ml-1.5">{statusConfig[selectedLead.status]?.label}</span>
                        </Badge>
                        <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-1", urgencyConfig[selectedLead.urgency]?.color)}>
                          {urgencyConfig[selectedLead.urgency]?.label} Urgency
                        </Badge>
                      </div>
                      <DialogTitle className="text-white text-xl font-bold leading-tight">{selectedLead.title}</DialogTitle>
                      <DialogDescription className="text-zinc-500 text-sm mt-1">{selectedLead.company} · {selectedLead.clientName}</DialogDescription>
                    </div>
                  </div>

                  {/* Dialog Body */}
                  <ScrollArea className="max-h-[calc(85vh-200px)]">
                    <div className="p-6 space-y-6">
                      {/* Client Info */}
                      <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Client Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { icon: <Users className="w-4 h-4" />, label: "Client", value: selectedLead.clientName },
                            { icon: <Briefcase className="w-4 h-4" />, label: "Company", value: selectedLead.company },
                            { icon: <MapPin className="w-4 h-4" />, label: "Country", value: selectedLead.country || "Global" },
                            { icon: <Clock className="w-4 h-4" />, label: "Created", value: timeAgo(new Date(selectedLead.foundAt)) },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                              <span className="text-zinc-600">{item.icon}</span>
                              <div>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{item.label}</p>
                                <p className="text-white text-sm font-medium">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Budget */}
                      <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Budget Range</h4>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-emerald-600/[0.02] border border-emerald-500/10">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                              <DollarSign className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedLead.budget.min)} – {formatCurrency(selectedLead.budget.max)}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Estimated project budget</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis Scores */}
                      <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          AI Analysis
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Success Probability", value: selectedLead.successProbability || 0, color: "emerald", icon: <Target className="w-4 h-4" /> },
                            { label: "Difficulty Score", value: selectedLead.difficulty || 50, color: "amber", icon: <BarChart3 className="w-4 h-4" /> },
                            { label: "Risk Level", value: selectedLead.riskLevel || 30, color: "red", icon: <AlertTriangle className="w-4 h-4" /> },
                          ].map((score, i) => (
                            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                              <div className={cn("mx-auto mb-2 p-2 rounded-lg w-fit", `bg-${score.color}-500/10`)}>
                                <span className={cn(`text-${score.color}-400`)}>{score.icon}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{score.label}</p>
                              <p className={cn("text-xl font-bold", `text-${score.color}-400`)}>{score.value}%</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technologies */}
                      {selectedLead.technologies && selectedLead.technologies.length > 0 && (
                        <div>
                          <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            Technologies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedLead.technologies.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs font-medium text-zinc-300 bg-white/[0.03] border-white/[0.08] px-3 py-1">
                                <Cpu className="w-3 h-3 mr-1.5 text-blue-400" />
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {selectedLead.skills && selectedLead.skills.length > 0 && (
                        <div>
                          <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedLead.skills.map((skill) => (
                              <span key={skill} className="text-xs font-medium text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {selectedLead.notes && (
                        <div>
                          <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Notes</h4>
                          <p className="text-sm text-zinc-400 leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            {selectedLead.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Action Buttons */}
                  <div className="p-6 pt-4 border-t border-white/[0.06] flex items-center gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold h-11 shadow-lg shadow-blue-500/20">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Proposal
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11">
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="ghost" className="border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11 px-4">
                      <Eye className="w-4 h-4 mr-2" />
                      View Original
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </ScrollArea>
      </div>
    </div>
  );
}
