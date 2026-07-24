"use client";

import { useState, useMemo, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockLeads } from "@/lib/mock-data";
import { initialMockProposals } from "@/lib/mock-proposals";
import { ProposalStats } from "@/components/proposals/ProposalStats";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import { ProposalGrid } from "@/components/proposals/ProposalGrid";
import { ProposalDetailDialog } from "@/components/proposals/ProposalDetailDialog";
import { MockProposal, SortOption, Toast } from "@/components/proposals/types";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<MockProposal[]>(initialMockProposals);
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
    (proposalId: string) => {
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
    (proposal: MockProposal) => {
      const duplicate: MockProposal = {
        ...proposal,
        id: `prop-${Date.now()}`,
        title: `${proposal.title} (Copy)`,
        status: "draft",
        submittedAt: undefined,
        createdAt: new Date().toISOString(),
      };
      setProposals((prev) => [duplicate, ...prev]);
      setSelectedProposal(null);
      showToast("Proposal duplicated as draft", "success");
    },
    [showToast]
  );

  const handleStartEdit = useCallback((proposal: MockProposal) => {
    setIsEditing(true);
    setEditTitle(proposal.title);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!selectedProposal) return;
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
    showToast("PDF export started - download will begin shortly", "info");
  }, [showToast]);

  const handleGenerate = async () => {
    setIsGenerating(true);
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
      />
    </div>
  );
}
