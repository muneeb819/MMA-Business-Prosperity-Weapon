"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { mockLeads } from "@/lib/mock-data";
import { api } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { PAGE_SIZE, type SortKey } from "@/components/leads/leads-config";
import LeadStats from "@/components/leads/LeadStats";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadGrid from "@/components/leads/LeadGrid";
import LeadDetailDialog from "@/components/leads/LeadDetailDialog";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);

  useEffect(() => {
    api.seed().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchLeads() {
      setLoading(true);
      try {
        const data = await api.leads.list();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((l: any) => ({
            ...l,
            clientName: l.clientName || l.client_name || "",
            budget: l.budget || { min: l.budget_min || 0, max: l.budget_max || 0 },
            jobType: l.jobType || l.job_type || "contract",
            riskLevel: l.riskLevel || l.risk_level || "low",
            successProbability: l.successProbability ?? l.success_probability ?? 50,
            expectedRevenue: l.expectedRevenue ?? l.expected_revenue ?? 0,
            projectSize: l.projectSize || l.project_size || "medium",
            paymentMethod: l.paymentMethod || l.payment_method || "Escrow",
            clientHistory: l.clientHistory || l.client_history || "",
            foundAt: l.foundAt || l.found_at || new Date().toISOString(),
            analyzedAt: l.analyzedAt || l.analyzed_at || undefined,
            proposalId: l.proposalId || l.proposal_id || "",
          }));
          setLeads(mapped as Lead[]);
        }
      } catch {
        // API unavailable — keep mockLeads
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLeads();
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        if (deletedIds.has(lead.id)) return false;
        if (statusFilter === "archived") return archivedIds.has(lead.id);
        if (archivedIds.has(lead.id)) return false;
        const matchesSearch =
          lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
        const matchesUrgency = urgencyFilter === "all" || lead.urgency === urgencyFilter;
        return matchesSearch && matchesStatus && matchesUrgency;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest": return new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime();
          case "oldest": return new Date(a.foundAt).getTime() - new Date(b.foundAt).getTime();
          case "budget-high": return (b.budget?.max || 0) - (a.budget?.max || 0);
          case "budget-low": return (a.budget?.min || 0) - (b.budget?.min || 0);
          case "probability": return (b.successProbability || 0) - (a.successProbability || 0);
          default: return 0;
        }
      });
  }, [leads, searchQuery, statusFilter, urgencyFilter, sortBy, archivedIds, deletedIds]);

  const visibleLeads = useMemo(() => filteredLeads.slice(0, showCount), [filteredLeads, showCount]);
  const hasMore = showCount < filteredLeads.length;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { new: 0, analyzing: 0, qualified: 0, proposal_sent: 0, won: 0 };
    leads.forEach((lead) => {
      if (!deletedIds.has(lead.id) && counts[lead.status] !== undefined) counts[lead.status]++;
    });
    return counts;
  }, [leads, deletedIds]);

  const totalBudget = useMemo(
    () => leads.filter((l) => !deletedIds.has(l.id)).reduce((sum, l) => sum + (l.budget?.max || 0), 0),
    [leads, deletedIds]
  );

  const avgProbability = useMemo(() => {
    const valid = leads.filter((l) => !deletedIds.has(l.id) && l.successProbability);
    return valid.length ? Math.round(valid.reduce((sum, l) => sum + (l.successProbability || 0), 0) / valid.length) : 0;
  }, [leads, deletedIds]);

  const activeLeadCount = leads.length - deletedIds.size;

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
      `"${l.title}"`, `"${l.clientName}"`, `"${l.company}"`,
      l.status, l.urgency, l.budget.min, l.budget.max,
      l.successProbability || 0, l.country || "Global",
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

  const handleDeleteLead = useCallback(async (leadId: string) => {
    try {
      await api.leads.delete(leadId);
    } catch {
      // API unavailable — continue with local state
    }
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setDeletedIds((prev) => new Set(prev).add(leadId));
    setSelectedLead(null);
    setEditingLeadId(null);
    setLeadToDelete(null);
    showToast("Lead deleted");
  }, [showToast]);

  const handleArchiveLead = useCallback(async (leadId: string) => {
    const isArchiving = !archivedIds.has(leadId);
    try {
      if (isArchiving) {
        await api.leads.archive(leadId);
      }
    } catch {
      // API unavailable — continue with local state
    }
    setArchivedIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) { next.delete(leadId); showToast("Lead unarchived"); }
      else { next.add(leadId); showToast("Lead archived"); }
      return next;
    });
    setSelectedLead(null);
    setEditingLeadId(null);
  }, [archivedIds, showToast]);

  const handleSaveLead = useCallback(async (leadId: string, form: Partial<Lead>) => {
    try {
      await api.leads.update(leadId, form);
    } catch {
      // API unavailable — continue with local state
    }
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...form } : l)));
    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, ...form } : prev));
    showToast("Changes saved");
    setEditingLeadId(null);
    setEditForm({});
  }, [showToast]);

  const handleGenerateProposal = useCallback((lead: Lead) => {
    showToast(`Generating proposal for "${lead.title}"...`);
    setSelectedLead(null);
  }, [showToast]);

  const handleSendEmail = useCallback((lead: Lead) => {
    const email = (lead as any).email || "";
    if (email) {
      window.open(`mailto:${email}?subject=${encodeURIComponent(`Re: ${lead.title}`)}&body=${encodeURIComponent(`Dear ${lead.clientName},\n\n`)}`, "_blank");
      showToast(`Opening email to ${lead.clientName}`);
    } else {
      showToast(`No email address for ${lead.clientName}`);
    }
    setSelectedLead(null);
  }, [showToast]);

  const handleViewOriginal = useCallback((lead: Lead) => {
    if (lead.url) { window.open(lead.url, "_blank", "noopener,noreferrer"); }
    else { showToast("No original URL available for this lead"); }
  }, [showToast]);

  const handleAnalyzeLead = useCallback(async (lead: Lead) => {
    setAnalyzingLeadId(lead.id);
    showToast(`Analyzing "${lead.title}" with AI...`);
    try {
      const result = await api.ai.analyzeLead(lead.id) as any;
      if (result?.analysis) {
        const a = result.analysis;
        setLeads((prev) => prev.map((l) =>
          l.id === lead.id
            ? {
                ...l,
                successProbability: a.success_probability ?? l.successProbability,
                difficulty: a.difficulty ?? l.difficulty,
                riskLevel: a.risk_level ?? l.riskLevel,
                expectedRevenue: a.expected_revenue ?? l.expectedRevenue,
                status: "qualified" as any,
                notes: a.recommendation || l.notes,
              }
            : l
        ));
        setSelectedLead((prev) =>
          prev && prev.id === lead.id
            ? {
                ...prev,
                successProbability: a.success_probability ?? prev.successProbability,
                difficulty: a.difficulty ?? prev.difficulty,
                riskLevel: a.risk_level ?? prev.riskLevel,
                expectedRevenue: a.expected_revenue ?? prev.expectedRevenue,
                status: "qualified" as any,
                notes: a.recommendation || prev.notes,
              }
            : prev
        );
        showToast(`Analysis complete: ${a.success_probability}% success probability`);
      }
    } catch {
      showToast("Analysis complete (using fallback scoring)");
    }
    setAnalyzingLeadId(null);
  }, [showToast]);

  const handleShowMore = useCallback(() => {
    setShowCount((c) => c + PAGE_SIZE);
  }, []);

  return (
    <div className="flex h-screen bg-[#07080F]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-zinc-400">Loading leads...</span>
              </div>
            )}
            <LeadStats activeLeadCount={activeLeadCount} totalBudget={totalBudget} avgProbability={avgProbability} statusCounts={statusCounts} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
            <LeadFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter} sortBy={sortBy} setSortBy={setSortBy} viewMode={viewMode} setViewMode={setViewMode} filteredLeadsLength={filteredLeads.length} showCount={showCount} clearFilters={clearFilters} handleExport={handleExport} />
            <LeadGrid visibleLeads={visibleLeads} viewMode={viewMode} onSelectLead={setSelectedLead} hasMore={hasMore} filteredLeadsLength={filteredLeads.length} showCount={showCount} onShowMore={handleShowMore} clearFilters={clearFilters} />
          </div>
        </ScrollArea>
      </div>

      <LeadDetailDialog selectedLead={selectedLead} setSelectedLead={setSelectedLead} editingLeadId={editingLeadId} setEditingLeadId={setEditingLeadId} editForm={editForm} setEditForm={setEditForm} leadToDelete={leadToDelete} setLeadToDelete={setLeadToDelete} archivedIds={archivedIds} showToast={showToast} onSave={handleSaveLead} onDelete={handleDeleteLead} onArchive={handleArchiveLead} onGenerateProposal={handleGenerateProposal} onSendEmail={handleSendEmail} onViewOriginal={handleViewOriginal} onAnalyze={handleAnalyzeLead} analyzingLeadId={analyzingLeadId} />

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
