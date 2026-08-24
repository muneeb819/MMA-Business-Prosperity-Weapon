"use client";

import React, { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  FileText,
  Send,
  CheckCircle2,
  Edit3,
  Copy,
  Download,
  Sparkles,
  Target,
  DollarSign,
  LayoutTemplate,
  Eye,
  Briefcase,
  X,
  Check,
  AlertCircle,
  Mail,
  Loader2,
  Shield,
} from "lucide-react";
import { MockProposal, Toast, proposalStatusConfig, toneOptions } from "./types";
import { ProposalQualityChecker } from "./ProposalQualityChecker";
import type { QualityResult } from "./ProposalQualityChecker";

interface ProposalDetailDialogProps {
  selectedProposal: MockProposal | null;
  setSelectedProposal: React.Dispatch<React.SetStateAction<MockProposal | null>>;
  setIsEditing: (value: boolean) => void;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (value: string) => void;
  detailTab: string;
  setDetailTab: (value: string) => void;
  handleSubmitProposal: (id: string) => void;
  handleStartEdit: (proposal: MockProposal) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleDuplicateProposal: (proposal: MockProposal) => void;
  handleExportPDF: () => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  showGenerateDialog: boolean;
  setShowGenerateDialog: (value: boolean) => void;
  genLeadId: string;
  setGenLeadId: (value: string) => void;
  genTone: string;
  setGenTone: (value: string) => void;
  genInstructions: string;
  setGenInstructions: (value: string) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  availableLeads?: Array<{id: string; title: string; company: string; clientName: string; source: string; location: string; tags: string[]}>;
}

const detailTabs = [
  { value: "cover", key: "coverLetter" as const, icon: <FileText className="w-4 h-4" />, title: "Cover Letter" },
  { value: "intro", key: "introduction" as const, icon: <Sparkles className="w-4 h-4" />, title: "Introduction" },
  { value: "technical", key: "technicalPlan" as const, icon: <Target className="w-4 h-4" />, title: "Technical Approach" },
  { value: "cost", key: "costEstimate" as const, icon: <DollarSign className="w-4 h-4" />, title: "Cost Estimate" },
  { value: "cta", key: "callToAction" as const, icon: <Send className="w-4 h-4" />, title: "Call to Action" },
];

function ProposalDetailDialogInner({
  selectedProposal,
  setSelectedProposal,
  setIsEditing,
  isEditing,
  editTitle,
  setEditTitle,
  detailTab,
  setDetailTab,
  handleSubmitProposal,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  handleDuplicateProposal,
  handleExportPDF,
  showToast,
  showGenerateDialog,
  setShowGenerateDialog,
  genLeadId,
  setGenLeadId,
  genTone,
  setGenTone,
  genInstructions,
  setGenInstructions,
  isGenerating,
  handleGenerate,
  toasts,
  dismissToast,
  availableLeads = [],
}: ProposalDetailDialogProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [qualityLoading, setQualityLoading] = useState(false);

  const handleQualityCheck = useCallback(async () => {
    if (!selectedProposal) return;
    setQualityLoading(true);
    setQualityResult(null);
    try {
      const p = selectedProposal as any;
      const result = await api.ai.checkQuality({
        title: p.title,
        cover_letter: p.sections?.coverLetter || "",
        introduction: p.sections?.introduction || "",
        technical_plan: p.sections?.technicalPlan || "",
        timeline: p.timeline || "",
        cost_estimate: p.sections?.costEstimate || "",
        call_to_action: p.sections?.callToAction || "",
        portfolio_suggestions: p.portfolioSuggestions || [],
      }) as QualityResult;
      setQualityResult(result);
    } catch {
      showToast("Quality check unavailable", "info");
    }
    setQualityLoading(false);
  }, [selectedProposal, showToast]);

  const handleSendEmail = useCallback(async () => {
    if (!emailRecipient.trim()) { showToast("Recipient email is required", "error"); return; }
    if (!selectedProposal) return;
    setIsSending(true);
    try {
      const result = await api.proposals.sendEmail(selectedProposal.id, {
        recipient_email: emailRecipient.trim(),
        subject: emailSubject.trim() || undefined,
        message: emailMessage.trim() || undefined,
      }) as any;
      if (result?.success) {
        showToast(`Proposal sent to ${emailRecipient.trim()}`, "success");
        setShowEmailDialog(false);
      } else {
        const body = `${emailMessage.trim() || "Dear " + selectedProposal.clientName + ",\n\nPlease find our proposal for " + selectedProposal.title + ".\n\n" + (selectedProposal.sections?.coverLetter || "")}\n\nBest regards,\nMMA Business Prosperity Weapon`;
        window.open(`mailto:${emailRecipient.trim()}?subject=${encodeURIComponent(emailSubject.trim() || `Proposal: ${selectedProposal.title}`)}&body=${encodeURIComponent(body)}`, "_blank");
        showToast("Opening email client (SMTP not configured)", "info");
        setShowEmailDialog(false);
      }
    } catch {
      const body = `Dear ${selectedProposal.clientName},\n\nPlease find our proposal for ${selectedProposal.title}.\n\n${selectedProposal.sections?.coverLetter || ""}\n\nBest regards,\nMMA Business Prosperity Weapon`;
      window.open(`mailto:${emailRecipient.trim()}?subject=${encodeURIComponent(`Proposal: ${selectedProposal.title}`)}&body=${encodeURIComponent(body)}`, "_blank");
      showToast("Opening email client (SMTP not configured)", "info");
      setShowEmailDialog(false);
    }
    setIsSending(false);
    setEmailRecipient("");
    setEmailSubject("");
    setEmailMessage("");
  }, [emailRecipient, emailSubject, emailMessage, selectedProposal, showToast]);

  return (
    <>
      <Dialog open={!!selectedProposal} onOpenChange={(open) => { if (!open) { setSelectedProposal(null); setIsEditing(false); } }}>
        <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-3xl max-h-[90vh] overflow-hidden p-0 z-50">
          {selectedProposal && (
            <>
              <div className="relative p-6 pb-4 border-b border-white/[0.06]">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-1 shrink-0", proposalStatusConfig[selectedProposal.status]?.bg, proposalStatusConfig[selectedProposal.status]?.color)}>
                      {proposalStatusConfig[selectedProposal.status]?.label}
                    </Badge>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(selectedProposal.budget)}
                      </div>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-white/[0.03] border-white/[0.08] text-white text-xl font-bold h-auto py-1"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                      />
                      <Button size="sm" onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 h-9 w-9 p-0">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="text-zinc-400 hover:text-white shrink-0 h-9 w-9 p-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <DialogTitle className="text-white text-xl font-bold leading-tight line-clamp-2">{selectedProposal.title}</DialogTitle>
                  )}
                  <DialogDescription className="text-zinc-500 text-sm mt-1 truncate">
                    {selectedProposal.company} · {selectedProposal.clientName}
                  </DialogDescription>
                </div>
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="flex flex-col">
                <div className="px-6 pt-4 border-b border-white/[0.06]">
                  <TabsList className="bg-white/[0.03] p-1 h-auto flex-wrap gap-1">
                    {detailTabs.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs data-[state=active]:bg-white/[0.1] data-[state=active]:text-white text-zinc-500 px-3 py-1.5">
                        {tab.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <ScrollArea className="max-h-[calc(90vh-360px)]">
                  {detailTabs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value} className="p-6 mt-0">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-blue-400">{tab.icon}</span>
                        <h3 className="text-white font-semibold text-sm">{tab.title}</h3>
                      </div>
                      <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden break-words">
                        {selectedProposal.sections[tab.key]}
                      </div>
                    </TabsContent>
                  ))}
                </ScrollArea>

                {selectedProposal.portfolioSuggestions && selectedProposal.portfolioSuggestions.length > 0 && (
                  <div className="px-6 pb-4 border-t border-white/[0.06] pt-4">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                      <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
                      Related Portfolio Projects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProposal.portfolioSuggestions.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          onClick={() => showToast(`Viewing portfolio: ${item}`, "info")}
                          className="text-xs font-medium text-zinc-400 bg-white/[0.03] border-white/[0.08] px-3 py-1.5 cursor-pointer hover:bg-white/[0.06] hover:text-white transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1.5" />
                          <span className="truncate max-w-[200px]">{item}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 pt-4 border-t border-white/[0.06] flex items-center gap-3 flex-wrap">
                  {selectedProposal.status === "draft" && (
                    <Button
                      onClick={() => handleSubmitProposal(selectedProposal.id)}
                      className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold h-11 shadow-lg shadow-blue-500/20"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Proposal
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleStartEdit(selectedProposal)}
                    disabled={isEditing}
                    className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11 disabled:opacity-40"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDuplicateProposal(selectedProposal)}
                    className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleQualityCheck}
                    disabled={qualityLoading}
                    className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-cyan-400 h-11"
                  >
                    {qualityLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                    Check Quality
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailRecipient(selectedProposal.company ? `contact@${selectedProposal.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` : "");
                      setEmailSubject(`Proposal: ${selectedProposal.title}`);
                      setEmailMessage("");
                      setShowEmailDialog(true);
                    }}
                    className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-blue-400 h-11"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
                {qualityResult && (
                  <div className="px-6 pb-4">
                    <ProposalQualityChecker result={qualityResult} onRunCheck={handleQualityCheck} />
                  </div>
                )}
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-lg z-50">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              AI Proposal Generator
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              Let AI craft a professional proposal based on the selected lead and your preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Select Lead</label>
              {availableLeads.length === 0 ? (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                  <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No leads found. Run the Opportunity Hunter first to fetch leads.</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[240px] rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="p-1">
                    {(() => {
                      const grouped: Record<string, typeof availableLeads> = {};
                      availableLeads.forEach((lead) => {
                        const src = lead.source || "Other";
                        if (!grouped[src]) grouped[src] = [];
                        grouped[src].push(lead);
                      });
                      const sourceEmojis: Record<string, string> = {
                        Himalayas: "🏔️", RemoteOK: "🌍", Remotive: "🏠",
                        "We Work Remotely": "🌐", Arbeitnow: "💼", Findwork: "🔍",
                      };
                      return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map(([source, leads]) => (
                        <div key={source} className="mb-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 sticky top-0 bg-[#0D0E18] z-10">
                            <span className="text-sm">{sourceEmojis[source] || "📋"}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{source}</span>
                            <span className="text-[10px] text-zinc-600 ml-auto">{leads.length}</span>
                          </div>
                          {leads.map((lead) => (
                            <button
                              key={lead.id}
                              onClick={() => setGenLeadId(lead.id)}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-start gap-3 group/item",
                                genLeadId === lead.id
                                  ? "bg-blue-500/10 border border-blue-500/30"
                                  : "hover:bg-white/[0.04] border border-transparent"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium truncate", genLeadId === lead.id ? "text-blue-300" : "text-white")}>{lead.title}</p>
                                <p className="text-xs text-zinc-500 truncate mt-0.5">{lead.company} · {lead.location}</p>
                                {lead.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {lead.tags.slice(0, 3).map((tag) => (
                                      <span key={tag} className="px-1.5 py-0.5 text-[9px] rounded bg-white/[0.05] text-zinc-500 border border-white/[0.06]">{tag}</span>
                                    ))}
                                    {lead.tags.length > 3 && <span className="text-[9px] text-zinc-600">+{lead.tags.length - 3}</span>}
                                  </div>
                                )}
                              </div>
                              {genLeadId === lead.id && (
                                <div className="shrink-0 mt-1"><Check className="w-4 h-4 text-blue-400" /></div>
                              )}
                            </button>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                </ScrollArea>
              )}
              {genLeadId && (
                <p className="text-[10px] text-zinc-600 mt-1.5 px-1">Selected: {availableLeads.find(l => l.id === genLeadId)?.title}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Proposal Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setGenTone(tone.value)}
                    className={cn(
                      "p-3 min-h-9 rounded-xl border text-left transition-all duration-300 overflow-hidden",
                      genTone === tone.value
                        ? "border-blue-500/40 bg-blue-500/[0.08] shadow-lg shadow-blue-500/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    )}
                  >
                    <p className={cn("text-sm font-semibold", genTone === tone.value ? "text-blue-300" : "text-white")}>{tone.label}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{tone.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Additional Instructions</label>
              <Textarea
                value={genInstructions}
                onChange={(e) => setGenInstructions(e.target.value)}
                placeholder="Any specific requirements, emphasis areas, or special instructions for the AI..."
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-700 min-h-[100px] resize-none focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={!genLeadId || isGenerating}
              className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold h-11 shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Proposal
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setShowGenerateDialog(false)} className="text-zinc-500 hover:text-white h-11 px-4">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-lg z-50">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              Send Proposal via Email
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              An AI-generated email with the proposal will be sent to the recipient. Configure SMTP in .env to enable delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Recipient Email *</label>
              <Input
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="client@company.com"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-700 h-11 focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Subject</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Proposal: {title}"
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-700 h-11 focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Custom Message (optional)</label>
              <Textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a personal note to include in the email body..."
                className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-700 min-h-[80px] resize-none focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSendEmail}
              disabled={!emailRecipient.trim() || isSending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold h-11 shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={() => setShowEmailDialog(false)} className="text-zinc-500 hover:text-white h-11 px-4">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl bg-zinc-900/80 animate-in slide-in-from-bottom-5 fade-in duration-300",
              toast.type === "success" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
              toast.type === "info" && "bg-blue-500/10 border-blue-500/30 text-blue-300",
              toast.type === "error" && "bg-red-500/10 border-red-500/30 text-red-300"
            )}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === "info" && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity shrink-0 h-9 w-9 flex items-center justify-center rounded-md">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export const ProposalDetailDialog = React.memo(ProposalDetailDialogInner);
