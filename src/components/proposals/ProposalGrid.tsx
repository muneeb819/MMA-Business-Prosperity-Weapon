"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";
import { MockProposal, proposalStatusConfig } from "./types";
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Edit3,
  Briefcase,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";

interface ProposalGridProps {
  filteredProposals: MockProposal[];
  onSelectProposal: (proposal: MockProposal) => void;
}

function ProposalGridInner({ filteredProposals, onSelectProposal }: ProposalGridProps) {
  if (filteredProposals.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pb-8">
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm font-medium">No proposals found</p>
          <p className="text-zinc-600 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pb-8">
      {filteredProposals.map((proposal) => {
        const sCfg = proposalStatusConfig[proposal.status] || proposalStatusConfig.draft;
        const prob = proposal.winProbability;

        return (
          <div
            key={proposal.id}
            onClick={() => onSelectProposal(proposal)}
            className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-zinc-900/80 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3 gap-2">
                <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-0.5 shrink-0", sCfg.bg, sCfg.color)}>
                  {proposal.status === "accepted" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {proposal.status === "submitted" && <Send className="w-3 h-3 mr-1" />}
                  {proposal.status === "draft" && <Edit3 className="w-3 h-3 mr-1" />}
                  {sCfg.label}
                </Badge>
                <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] shrink-0">
                  <Clock className="w-3 h-3" />
                  {timeAgo(new Date(proposal.createdAt))}
                </div>
              </div>

              <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 group-hover:text-indigo-300 transition-colors line-clamp-2">
                {proposal.title}
              </h3>
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-4 truncate">
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{proposal.company}</span>
                <span className="text-zinc-700">·</span>
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{proposal.clientName}</span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Win Probability</span>
                  <span className={cn("text-sm font-bold", prob >= 70 ? "text-emerald-400" : prob >= 40 ? "text-amber-400" : "text-red-400")}>{prob}%</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", prob >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400" : prob >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400")}
                    style={{ width: `${prob}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] gap-2">
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold shrink-0">
                  <DollarSign className="w-3.5 h-3.5" />
                  {formatCurrency(proposal.budget)}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-600 min-w-0">
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3" />
                    Created {timeAgo(new Date(proposal.createdAt))}
                  </span>
                  {proposal.submittedAt && (
                    <span className="flex items-center gap-1 text-indigo-400/60 shrink-0">
                      <Send className="w-3 h-3" />
                      Sent {timeAgo(new Date(proposal.submittedAt))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const ProposalGrid = React.memo(ProposalGridInner);
