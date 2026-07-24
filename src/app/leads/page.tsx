"use client";

import { useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Clock,
  AlertTriangle,
  Globe,
  DollarSign,
  BarChart3,
  Brain,
  Sparkles,
  X,
  Briefcase,
  MapPin,
  Cpu,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  List,
  Download,
  Pencil,
  Trash2,
  Archive,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  Check,
} from "lucide-react";

type SortKey = "newest" | "oldest" | "budget-high" | "budget-low" | "probability";

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

const PAGE_SIZE = 9;

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const filteredLeads = useMemo(() => {
    return mockLeads
      .filter((lead) => {
        if (deletedIds.has(lead.id)) return false;
        if (archivedIds.has(lead.id) && statusFilter !== "archived") return false;
        const matchesSearch =
          lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          statusFilter === "archived"
            ? true
            : lead.status === statusFilter;
        const matchesUrgency = urgencyFilter === "all" || lead.urgency === urgencyFilter;
        return matchesSearch && matchesStatus && matchesUrgency;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime();
          case "oldest":
            return new Date(a.foundAt).getTime() - new Date(b.foundAt).getTime();
          case "budget-high":
            return (b.budget?.max || 0) - (a.budget?.max || 0);
          case "budget-low":
            return (a.budget?.min || 0) - (b.budget?.min || 0);
          case "probability":
            return (b.successProbability || 0) - (a.successProbability || 0);
          default:
            return 0;
        }
      });
  }, [searchQuery, statusFilter, urgencyFilter, sortBy, archivedIds, deletedIds]);

  const visibleLeads = useMemo(() => filteredLeads.slice(0, showCount), [filteredLeads, showCount]);
  const hasMore = showCount < filteredLeads.length;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { new: 0, analyzing: 0, qualified: 0, proposal_sent: 0, won: 0 };
    mockLeads.forEach((lead) => {
      if (!deletedIds.has(lead.id) && counts[lead.status] !== undefined) counts[lead.status]++;
    });
    return counts;
  }, [deletedIds]);

  const totalBudget = useMemo(
    () => mockLeads.filter((l) => !deletedIds.has(l.id)).reduce((sum, l) => sum + (l.budget?.max || 0), 0),
    [deletedIds]
  );

  const avgProbability = useMemo(() => {
    const valid = mockLeads.filter((l) => !deletedIds.has(l.id) && l.successProbability);
    return valid.length ? Math.round(valid.reduce((sum, l) => sum + (l.successProbability || 0), 0) / valid.length) : 0;
  }, [deletedIds]);

  const activeLeadCount = mockLeads.length - deletedIds.size;

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setUrgencyFilter("all");
    setSortBy("newest");
    setShowCount(PAGE_SIZE);
  }, []);

  const handleExport = useCallback(() => {
    const headers = ["Title", "Client", "Company", "Status", "Urgency", "Budget Min", "Budget Max", "Probability", "Country"];
    const rows = filteredLeads.map((l) => [
      `"${l.title}"`,
      `"${l.clientName}"`,
      `"${l.company}"`,
      l.status,
      l.urgency,
      l.budget.min,
      l.budget.max,
      l.successProbability || 0,
      l.country || "Global",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredLeads.length} leads`);
  }, [filteredLeads, showToast]);

  const handleDeleteLead = useCallback(
    (leadId: string) => {
      setDeletedIds((prev) => new Set(prev).add(leadId));
      setSelectedLead(null);
      setEditingLeadId(null);
      showToast("Lead deleted");
    },
    [showToast]
  );

  const handleArchiveLead = useCallback(
    (leadId: string) => {
      setArchivedIds((prev) => {
        const next = new Set(prev);
        if (next.has(leadId)) {
          next.delete(leadId);
          showToast("Lead unarchived");
        } else {
          next.add(leadId);
          showToast("Lead archived");
        }
        return next;
      });
      setSelectedLead(null);
      setEditingLeadId(null);
    },
    [showToast]
  );

  const handleGenerateProposal = useCallback(
    (lead: Lead) => {
      showToast(`Generating proposal for "${lead.title}"...`);
      setSelectedLead(null);
    },
    [showToast]
  );

  const handleSendEmail = useCallback(
    (lead: Lead) => {
      showToast(`Opening email to ${lead.clientName} (${lead.email})`);
      setSelectedLead(null);
    },
    [showToast]
  );

  const handleViewOriginal = useCallback(
    (lead: Lead) => {
      if (lead.url) {
        window.open(lead.url, "_blank", "noopener,noreferrer");
      } else {
        showToast("No original URL available for this lead");
      }
    },
    [showToast]
  );

  return (
    <div className="flex h-screen bg-[#07080F]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                { label: "Total Leads", value: activeLeadCount, icon: <Users className="w-5 h-5" />, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5 border-blue-500/20" },
                { label: "Total Pipeline", value: formatCurrency(totalBudget), icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20" },
                { label: "Avg. Win Probability", value: `${avgProbability}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-400", bg: "from-amber-500/10 to-amber-600/5 border-amber-500/20" },
                { label: "Conversion Rate", value: `${activeLeadCount ? Math.round((statusCounts.won / activeLeadCount) * 100) : 0}%`, icon: <Target className="w-5 h-5" />, color: "text-violet-400", bg: "from-violet-500/10 to-violet-600/5 border-violet-500/20" },
              ].map((stat, i) => (
                <Card key={i} className={cn("bg-gradient-to-br border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500", stat.bg)} style={{ animationDelay: `${i * 80}ms` }}>
                  <CardContent className="p-4 flex items-center gap-4 overflow-hidden">
                    <div className={cn("p-2.5 rounded-xl bg-gradient-to-br border shrink-0", stat.bg)}>
                      <span className={stat.color}>{stat.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium truncate">{stat.label}</p>
                      <p className="text-xl font-bold text-white mt-0.5 truncate">{stat.value}</p>
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
                      "group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-500",
                      statusFilter === card.key
                        ? "border-white/20 bg-white/[0.06] scale-[1.03]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    )}
                    style={{ animationDelay: `${400 + i * 60}ms` }}
                  >
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br pointer-events-none", card.color, "opacity-10")} />
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
              <div className="relative flex-1 min-w-0">
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
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger className="w-full sm:w-48 bg-white/[0.03] border-white/[0.08] text-white h-11">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-zinc-500" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#12131C] border-white/10">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                  <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                  <SelectItem value="probability">Probability: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Bar */}
            <div className="flex items-center justify-between mt-6 mb-4 flex-wrap gap-3">
              <p className="text-sm text-zinc-500">
                Showing <span className="text-white font-semibold">{Math.min(showCount, filteredLeads.length)}</span> of{" "}
                <span className="text-white font-semibold">{filteredLeads.length}</span> leads
              </p>
              <div className="flex items-center gap-2">
                {(searchQuery || statusFilter !== "all" || urgencyFilter !== "all" || sortBy !== "newest") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-white text-xs">
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear filters
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleExport} className="text-zinc-500 hover:text-white text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Export
                </Button>
                <div className="flex items-center border border-white/[0.08] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "grid" ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-400"
                    )}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "list" ? "bg-white/[0.08] text-white" : "text-zinc-600 hover:text-zinc-400"
                    )}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Lead Cards */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleLeads.map((lead, i) => {
                  const sCfg = statusConfig[lead.status] || statusConfig.new;
                  const uCfg = urgencyConfig[lead.urgency] || urgencyConfig.low;
                  const prob = lead.successProbability || 0;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.05] transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 fill-mode-both overflow-hidden"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 shrink-0", sCfg.bg, sCfg.color)}>
                              {sCfg.icon}
                              <span className="ml-1">{sCfg.label}</span>
                            </Badge>
                            <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 shrink-0", uCfg.color)}>
                              {uCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] shrink-0">
                            <Clock className="w-3 h-3" />
                            <span className="whitespace-nowrap">{timeAgo(new Date(lead.foundAt))}</span>
                          </div>
                        </div>

                        <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                          {lead.title}
                        </h3>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-3">
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lead.company}</span>
                          <span className="text-zinc-700 shrink-0">·</span>
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lead.clientName}</span>
                        </div>

                        <div className="flex items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs min-w-0">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{lead.country || "Global"}</span>
                          </div>
                          <div className="text-emerald-400 text-xs font-semibold whitespace-nowrap">
                            {formatCurrency(lead.budget.min)} – {formatCurrency(lead.budget.max)}
                          </div>
                        </div>

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
            ) : (
              <div className="flex flex-col gap-3">
                {visibleLeads.map((lead, i) => {
                  const sCfg = statusConfig[lead.status] || statusConfig.new;
                  const uCfg = urgencyConfig[lead.urgency] || urgencyConfig.low;
                  const prob = lead.successProbability || 0;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="group cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both overflow-hidden"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5", sCfg.bg, sCfg.color)}>
                            {sCfg.icon}
                            <span className="ml-1 hidden sm:inline">{sCfg.label}</span>
                          </Badge>
                          <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 hidden sm:inline-flex", uCfg.color)}>
                            {uCfg.label}
                          </Badge>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-blue-300 transition-colors truncate">
                            {lead.title}
                          </h3>
                          <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                            <span className="truncate">{lead.company}</span>
                            <span className="text-zinc-700">·</span>
                            <span className="truncate">{lead.clientName}</span>
                            <span className="text-zinc-700">·</span>
                            <span className="truncate">{lead.country || "Global"}</span>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                          <div className="text-center">
                            <p className="text-[10px] text-zinc-600 uppercase">Budget</p>
                            <p className="text-xs font-semibold text-emerald-400 whitespace-nowrap">{formatCurrency(lead.budget.max)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-zinc-600 uppercase">Probability</p>
                            <p className={cn("text-xs font-bold", prob >= 70 ? "text-emerald-400" : prob >= 40 ? "text-amber-400" : "text-red-400")}>{prob}%</p>
                          </div>
                          <div className="w-24">
                            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-700", prob >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400" : prob >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400")}
                                style={{ width: `${prob}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] shrink-0">
                          <Clock className="w-3 h-3" />
                          <span className="whitespace-nowrap">{timeAgo(new Date(lead.foundAt))}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCount((c) => c + PAGE_SIZE)}
                  className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Load More ({filteredLeads.length - showCount} remaining)
                </Button>
              </div>
            )}

            {/* Empty State */}
            {filteredLeads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500 font-medium">No leads found</p>
                <p className="text-zinc-700 text-sm mt-1">Try adjusting your search or filters</p>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4 text-zinc-500 hover:text-white text-xs">
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLead(null);
            setEditingLeadId(null);
          }
        }}
      >
        <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-2xl max-h-[85vh] overflow-hidden p-0 z-50">
          {selectedLead && (
            <>
              <div className="relative p-6 pb-4 border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-1 shrink-0", statusConfig[selectedLead.status]?.bg, statusConfig[selectedLead.status]?.color)}>
                        {statusConfig[selectedLead.status]?.icon}
                        <span className="ml-1.5">{statusConfig[selectedLead.status]?.label}</span>
                      </Badge>
                      <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-1 shrink-0", urgencyConfig[selectedLead.urgency]?.color)}>
                        {urgencyConfig[selectedLead.urgency]?.label} Urgency
                      </Badge>
                      {editingLeadId === selectedLead.id && (
                        <Badge variant="outline" className="text-[11px] font-semibold border px-2.5 py-1 bg-amber-500/10 border-amber-500/20 text-amber-400">
                          <Pencil className="w-3 h-3 mr-1" />
                          Editing
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLead(null);
                        setEditingLeadId(null);
                      }}
                      className="text-zinc-500 hover:text-white shrink-0 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <DialogTitle className="text-white text-xl font-bold leading-tight">{selectedLead.title}</DialogTitle>
                  <DialogDescription className="text-zinc-500 text-sm mt-1">
                    {selectedLead.company} · {selectedLead.clientName}
                  </DialogDescription>
                </div>
              </div>

              <ScrollArea className="max-h-[calc(85vh-220px)]">
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
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                          <span className="text-zinc-600 shrink-0">{item.icon}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{item.label}</p>
                            <p className="text-white text-sm font-medium truncate">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedLead.description && (
                    <div>
                      <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Description</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        {selectedLead.description}
                      </p>
                    </div>
                  )}

                  {/* Budget */}
                  <div>
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Budget Range</h4>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-emerald-600/[0.02] border border-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                          <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-2xl font-bold text-emerald-400 truncate">
                            {formatCurrency(selectedLead.budget.min)} – {formatCurrency(selectedLead.budget.max)}
                          </p>
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
                        { label: "Risk Level", value: selectedLead.riskLevel === "low" ? 20 : selectedLead.riskLevel === "medium" ? 50 : selectedLead.riskLevel === "high" ? 75 : 90, color: "red", icon: <AlertTriangle className="w-4 h-4" /> },
                      ].map((score, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center overflow-hidden">
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
              <div className="p-6 pt-4 border-t border-white/[0.06]">
                {editingLeadId === selectedLead.id ? (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        showToast("Changes saved");
                        setEditingLeadId(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold h-11 shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingLeadId(null)}
                      className="flex-1 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleGenerateProposal(selectedLead)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold h-11 shadow-lg shadow-blue-500/20"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Proposal
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSendEmail(selectedLead)}
                        className="flex-1 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleViewOriginal(selectedLead)}
                        className="border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11 px-4"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Original
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLeadId(selectedLead.id)}
                        className="text-zinc-500 hover:text-amber-400 text-xs"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveLead(selectedLead.id)}
                        className="text-zinc-500 hover:text-blue-400 text-xs"
                      >
                        <Archive className="w-3.5 h-3.5 mr-1" />
                        {archivedIds.has(selectedLead.id) ? "Unarchive" : "Archive"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLead(selectedLead.id)}
                        className="text-zinc-500 hover:text-red-400 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#12131C] border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/50 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
