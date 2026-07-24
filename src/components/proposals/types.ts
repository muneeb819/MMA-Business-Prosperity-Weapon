export interface MockProposal {
  id: string;
  title: string;
  clientName: string;
  company: string;
  status: string;
  winProbability: number;
  budget: number;
  createdAt: string;
  submittedAt?: string;
  sections: {
    coverLetter: string;
    introduction: string;
    technicalPlan: string;
    costEstimate: string;
    callToAction: string;
  };
  portfolioSuggestions: string[];
}

export type SortOption = "newest" | "oldest" | "budget-high" | "budget-low" | "win-high" | "win-low";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

export const proposalStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
  submitted: { label: "Submitted", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  accepted: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  revision: { label: "Revision", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

export const toneOptions = [
  { value: "professional", label: "Professional", description: "Formal and business-oriented" },
  { value: "technical", label: "Technical", description: "Focus on technical expertise" },
  { value: "persuasive", label: "Persuasive", description: "Emphasis on value proposition" },
  { value: "collaborative", label: "Collaborative", description: "Partnership-focused approach" },
];
