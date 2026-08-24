"use client";

import { memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { statusConfig, urgencyConfig } from "./leads-config";
import {
  Users,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Layers,
  Cpu,
  Pencil,
  Trash2,
  Archive,
  ExternalLink,
  FileText,
  MessageSquare,
  X,
  Check,
} from "lucide-react";

interface LeadDetailDialogProps {
  selectedLead: Lead | null;
  setSelectedLead: Dispatch<SetStateAction<Lead | null>>;
  editingLeadId: string | null;
  setEditingLeadId: Dispatch<SetStateAction<string | null>>;
  editForm: Partial<Lead>;
  setEditForm: Dispatch<SetStateAction<Partial<Lead>>>;
  leadToDelete: string | null;
  setLeadToDelete: Dispatch<SetStateAction<string | null>>;
  archivedIds: Set<string>;
  showToast: (msg: string) => void;
  onSave: (leadId: string, form: Partial<Lead>) => void;
  onDelete: (leadId: string) => void;
  onArchive: (leadId: string) => void;
  onGenerateProposal: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onViewOriginal: (lead: Lead) => void;
  onAnalyze?: (lead: Lead) => void;
  analyzingLeadId?: string | null;
}

const LeadDetailDialog = memo(function LeadDetailDialog({
  selectedLead,
  setSelectedLead,
  editingLeadId,
  setEditingLeadId,
  editForm,
  setEditForm,
  leadToDelete,
  setLeadToDelete,
  archivedIds,
  showToast,
  onSave,
  onDelete,
  onArchive,
  onGenerateProposal,
  onSendEmail,
  onViewOriginal,
  onAnalyze,
  analyzingLeadId,
}: LeadDetailDialogProps) {
  const handleClose = () => {
    setSelectedLead(null);
    setEditingLeadId(null);
    setLeadToDelete(null);
  };

  return (
    <Dialog
      open={!!selectedLead}
      onOpenChange={(open) => {
        if (!open) handleClose();
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
                    onClick={handleClose}
                    className="text-zinc-500 hover:text-white shrink-0 h-9 w-9 p-0"
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

                {selectedLead.description && (
                  <div>
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Description</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      {selectedLead.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Budget Range</h4>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-emerald-600/[0.02] border border-emerald-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-2xl font-bold text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
                          {formatCurrency(selectedLead.budget.min)} – {formatCurrency(selectedLead.budget.max)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">Estimated project budget</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                    ].map((score, i) => {
                      const scoreColorClass: Record<string, { bg: string; text: string }> = {
                        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
                        amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
                        red: { bg: "bg-red-500/10", text: "text-red-400" },
                      };
                      const sc = scoreColorClass[score.color] ?? scoreColorClass.emerald;
                      return (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center overflow-hidden">
                        <div className={cn("mx-auto mb-2 p-2 rounded-lg w-fit", sc.bg)}>
                          <span className={cn(sc.text)}>{score.icon}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{score.label}</p>
                        <p className={cn("text-xl font-bold", sc.text)}>{score.value}%</p>
                      </div>
                      );
                    })}
                  </div>
                </div>

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

            <div className="p-6 pt-4 border-t border-white/[0.06]">
              {editingLeadId === selectedLead.id ? (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => onSave(selectedLead.id, editForm)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold h-11 shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setEditingLeadId(null); setEditForm({}); }}
                    className="flex-1 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ) : leadToDelete === selectedLead.id ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-zinc-400 mr-2">Are you sure you want to delete?</p>
                  <Button
                    onClick={() => onDelete(selectedLead.id)}
                    className="bg-red-600 hover:bg-red-500 text-white font-semibold h-9 px-4"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLeadToDelete(null)}
                    className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-9 px-4"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => onGenerateProposal(selectedLead)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold h-11 shadow-lg shadow-blue-500/20"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Proposal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onAnalyze?.(selectedLead)}
                      disabled={analyzingLeadId === selectedLead.id}
                      className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11 disabled:opacity-50"
                    >
                      {analyzingLeadId === selectedLead.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Analyze
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onSendEmail(selectedLead)}
                      className="flex-1 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onViewOriginal(selectedLead)}
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
                      onClick={() => { setEditingLeadId(selectedLead.id); setEditForm({}); }}
                      className="text-zinc-500 hover:text-amber-400 text-xs h-9"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(selectedLead.id)}
                      className="text-zinc-500 hover:text-blue-400 text-xs h-9"
                    >
                      <Archive className="w-3.5 h-3.5 mr-1" />
                      {archivedIds.has(selectedLead.id) ? "Unarchive" : "Archive"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLeadToDelete(selectedLead.id)}
                      className="text-zinc-500 hover:text-red-400 text-xs h-9"
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
  );
});

export default LeadDetailDialog;
