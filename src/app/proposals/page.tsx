"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockLeads } from "@/lib/mock-data";
import { initialMockProposals } from "@/lib/mock-proposals";
import { api } from "@/lib/api";
import { ProposalStats } from "@/components/proposals/ProposalStats";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import { ProposalGrid } from "@/components/proposals/ProposalGrid";
import { ProposalDetailDialog } from "@/components/proposals/ProposalDetailDialog";
import { MockProposal, SortOption, Toast } from "@/components/proposals/types";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Footer } from "@/components/footer";
function mapApiProposalToMock(p: any): MockProposal {
  const sections = p.sections || {};
  return {
    id: p.id,
    title: p.title,
    clientName: p.clientName || "Client",
    company: p.company || "Company",
    status: p.status || "draft",
    winProbability: p.winProbability || 0,
    budget: typeof p.budget === "number" ? p.budget : (p.budget?.max || p.budget_max || 0),
    createdAt: p.createdAt || p.created_at || new Date().toISOString(),
    submittedAt: p.submittedAt || p.submitted_at || undefined,
    sections: {
      coverLetter: p.coverLetter || sections.coverLetter || p.cover_letter || "",
      introduction: p.introduction || sections.introduction || "",
      technicalPlan: p.technicalPlan || sections.technicalPlan || p.technical_plan || "",
      costEstimate: p.costEstimate || sections.costEstimate || p.cost_estimate || "",
      callToAction: p.callToAction || sections.callToAction || p.call_to_action || "",
    },
    portfolioSuggestions: p.portfolioSuggestions || p.portfolio_suggestions || [],
  };
}

export default function ProposalsPage() {
  useEffect(() => { document.title = "Proposals | MBPW"; }, []);
  const [proposals, setProposals] = useState<MockProposal[]>(initialMockProposals);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<MockProposal | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [genLeadId, setGenLeadId] = useState("");
  const [genTone, setGenTone] = useState("professional");
  const [genInstructions, setGenInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [detailTab, setDetailTab] = useState("cover");
  const [availableLeads, setAvailableLeads] = useState<Array<{id: string; title: string; company: string; clientName: string}>>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProposals() {
      setLoading(true);
      try {
        const data = await api.proposals.list();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setProposals(data.map(mapApiProposalToMock));
        }
      } catch {
        // API unavailable — keep mockProposals
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    async function fetchLeads() {
      try {
        const data = await api.leads.list();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setAvailableLeads(data.map((l: any) => ({
            id: l.id,
            title: l.title,
            company: l.company || "Unknown",
            clientName: l.clientName || l.client_name || "Client",
          })));
        }
      } catch {
        // API unavailable — keep mockLeads
      }
    }
    fetchProposals();
    fetchLeads();
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const stats = useMemo(() => {
    const drafts = proposals.filter((p) => p.status === "draft").length;
    const submitted = proposals.filter((p) => p.status === "submitted").length;
    const accepted = proposals.filter((p) => p.status === "accepted").length;
    const rejected = proposals.filter((p) => p.status === "rejected").length;
    const revision = proposals.filter((p) => p.status === "revision").length;
    const avgWin = proposals.length
      ? Math.round(proposals.reduce((sum, p) => sum + p.winProbability, 0) / proposals.length)
      : 0;
    return { drafts, submitted, accepted, rejected, revision, avgWin, total: proposals.length };
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    let result = [...proposals];
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "budget-high": result.sort((a, b) => b.budget - a.budget); break;
      case "budget-low": result.sort((a, b) => a.budget - b.budget); break;
      case "win-high": result.sort((a, b) => b.winProbability - a.winProbability); break;
      case "win-low": result.sort((a, b) => a.winProbability - b.winProbability); break;
    }
    return result;
  }, [proposals, statusFilter, searchQuery, sortBy]);

  const handleSubmitProposal = useCallback(
    async (proposalId: string) => {
      try {
        await api.proposals.submit(proposalId);
      } catch {
        // API unavailable — continue with local state
      }
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "submitted", submittedAt: new Date().toISOString() } : p
        )
      );
      setSelectedProposal((prev) =>
        prev && prev.id === proposalId
          ? { ...prev, status: "submitted", submittedAt: new Date().toISOString() }
          : prev
      );
      showToast("Proposal submitted successfully!", "success");
    },
    [showToast]
  );

  const handleDuplicateProposal = useCallback(
    async (proposal: MockProposal) => {
      try {
        const result = await api.proposals.duplicate(proposal.id);
        if (result && typeof result === "object") {
          setProposals((prev) => [mapApiProposalToMock(result), ...prev]);
        }
      } catch {
        // API unavailable — do local duplicate
        const duplicate: MockProposal = {
          ...proposal,
          id: `prop-${Date.now()}`,
          title: `${proposal.title} (Copy)`,
          status: "draft",
          submittedAt: undefined,
          createdAt: new Date().toISOString(),
        };
        setProposals((prev) => [duplicate, ...prev]);
      }
      setSelectedProposal(null);
      showToast("Proposal duplicated as draft", "success");
    },
    [showToast]
  );

  const handleStartEdit = useCallback((proposal: MockProposal) => {
    setIsEditing(true);
    setEditTitle(proposal.title);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedProposal) return;
    try {
      await api.proposals.update(selectedProposal.id, { title: editTitle } as any);
    } catch {
      // API unavailable — continue with local state
    }
    setProposals((prev) =>
      prev.map((p) => (p.id === selectedProposal.id ? { ...p, title: editTitle } : p))
    );
    setSelectedProposal((prev) => (prev ? { ...prev, title: editTitle } : prev));
    setIsEditing(false);
    showToast("Proposal updated", "success");
  }, [selectedProposal, editTitle, showToast]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditTitle("");
  }, []);

  const handleExportPDF = useCallback(() => {
    if (!selectedProposal) { showToast("No proposal selected", "error"); return; }
    const p = selectedProposal;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${p.title}</title>
<style>
@page{size:A4;margin:20mm 18mm}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1a1a2e;margin:0;padding:0;line-height:1.6;font-size:11pt}
.header{border-bottom:3px solid #3b82f6;padding-bottom:16px;margin-bottom:24px}
.header h1{font-size:22pt;color:#1a1a2e;margin:0 0 6px 0}
.header .meta{color:#6b7280;font-size:10pt}
.header .meta span{margin-right:16px}
.status{display:inline-block;background:#dbeafe;color:#1e40af;padding:2px 10px;border-radius:4px;font-size:9pt;font-weight:600;text-transform:uppercase}
.budget{float:right;font-size:16pt;font-weight:700;color:#059669}
.section{margin-bottom:20px;page-break-inside:avoid}
.section h2{font-size:13pt;color:#3b82f6;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:0 0 10px 0}
.section .content{color:#374151;white-space:pre-wrap;font-size:10.5pt}
.footer{border-top:2px solid #e5e7eb;padding-top:12px;margin-top:30px;text-align:center;color:#9ca3af;font-size:8pt}
@media print{body{margin:0}}
</style></head><body>
<div class="header">
<div class="budget">$${p.budget.toLocaleString()}</div>
<h1>${p.title}</h1>
<div class="meta">
<span class="status">${p.status.toUpperCase()}</span>
<span>Client: ${p.clientName}</span>
<span>Company: ${p.company}</span>
<span>Win Probability: ${p.winProbability}%</span>
<span>Date: ${new Date().toLocaleDateString()}</span>
</div></div>
<div class="section"><h2>1. Cover Letter</h2><div class="content">${(p.sections.coverLetter || "Not provided").replace(/</g,"&lt;")}</div></div>
<div class="section"><h2>2. Introduction</h2><div class="content">${(p.sections.introduction || "Not provided").replace(/</g,"&lt;")}</div></div>
<div class="section"><h2>3. Technical Approach</h2><div class="content">${(p.sections.technicalPlan || "Not provided").replace(/</g,"&lt;")}</div></div>
<div class="section"><h2>4. Cost Estimate</h2><div class="content">${(p.sections.costEstimate || "Not provided").replace(/</g,"&lt;")}</div></div>
<div class="section"><h2>5. Call to Action</h2><div class="content">${(p.sections.callToAction || "Not provided").replace(/</g,"&lt;")}</div></div>
${p.portfolioSuggestions?.length ? `<div class="section"><h2>Related Portfolio Projects</h2><div class="content">${p.portfolioSuggestions.join(" · ")}</div></div>` : ""}
<div class="footer">Generated by MMA Business Prosperity Weapon · ${new Date().toLocaleString()}</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => { w.print(); }, 300); showToast("PDF ready — use Save as PDF in the print dialog", "success"); }
    else { showToast("Popup blocked — allow popups for this site", "error"); }
  }, [selectedProposal, showToast]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await api.proposals.generate({
        leadId: genLeadId,
        tone: genTone,
        instructions: genInstructions || undefined,
      });
      if (result && typeof result === "object") {
        setProposals((prev) => [mapApiProposalToMock(result), ...prev]);
      }
    } catch {
      // API unavailable — do local generation
      await new Promise((r) => setTimeout(r, 2500));
      const lead = mockLeads.find((l) => l.id === genLeadId);
      const newProposal: MockProposal = {
        id: `prop-${Date.now()}`,
        title: `${lead?.title || "New"} Proposal`,
        clientName: lead?.clientName || "Unknown",
        company: lead?.company || "Unknown",
        status: "draft",
        winProbability: Math.floor(Math.random() * 40) + 50,
        budget: lead ? Math.floor((lead.budget.min + lead.budget.max) / 2) : 50000,
        createdAt: new Date().toISOString(),
        sections: {
          coverLetter: "AI-generated cover letter will appear here.",
          introduction: "AI-generated introduction will appear here.",
          technicalPlan: "AI-generated technical plan will appear here.",
          costEstimate: "AI-generated cost estimate will appear here.",
          callToAction: "AI-generated call to action will appear here.",
        },
        portfolioSuggestions: [],
      };
      setProposals((prev) => [newProposal, ...prev]);
    }
    setIsGenerating(false);
    setShowGenerateDialog(false);
    setGenLeadId("");
    setGenTone("professional");
    setGenInstructions("");
    showToast("Proposal generated successfully!", "success");
  };

  const totalBudget = proposals.reduce((s, p) => s + p.budget, 0);

  const statusFilters = [
    { key: "all", label: "All", count: stats.total },
    { key: "draft", label: "Draft", count: stats.drafts },
    { key: "submitted", label: "Submitted", count: stats.submitted },
    { key: "accepted", label: "Accepted", count: stats.accepted },
    { key: "rejected", label: "Rejected", count: stats.rejected },
    { key: "revision", label: "Revision", count: stats.revision },
  ];

  return (
    <div className="flex h-screen bg-[#07080F]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <ScrollArea className="flex-1 px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-zinc-400">Loading proposals...</span>
            </div>
          )}
          <Breadcrumbs />
          <ProposalStats stats={stats} totalBudget={totalBudget} />

          <div className="mt-6 space-y-4">
            <ProposalFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              statusFilters={statusFilters}
              onOpenGenerate={() => setShowGenerateDialog(true)}
            />
          </div>

          <ProposalGrid
            filteredProposals={filteredProposals}
            onSelectProposal={(p) => {
              setSelectedProposal(p);
              setIsEditing(false);
              setDetailTab("cover");
            }}
          />
        </ScrollArea>
        <Footer />
      </div>

      <ProposalDetailDialog
        selectedProposal={selectedProposal}
        setSelectedProposal={setSelectedProposal}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        handleSubmitProposal={handleSubmitProposal}
        handleStartEdit={handleStartEdit}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={handleCancelEdit}
        handleDuplicateProposal={handleDuplicateProposal}
        handleExportPDF={handleExportPDF}
        showToast={showToast}
        showGenerateDialog={showGenerateDialog}
        setShowGenerateDialog={setShowGenerateDialog}
        genLeadId={genLeadId}
        setGenLeadId={setGenLeadId}
        genTone={genTone}
        setGenTone={setGenTone}
        genInstructions={genInstructions}
        setGenInstructions={setGenInstructions}
        isGenerating={isGenerating}
        handleGenerate={handleGenerate}
        toasts={toasts}
        dismissToast={dismissToast}
        availableLeads={availableLeads}
      />
    </div>
  );
}
