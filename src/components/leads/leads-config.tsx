import type { ReactNode } from "react";
import { Zap, Brain, CheckCircle2, Send, Target, AlertTriangle } from "lucide-react";

export type SortKey = "newest" | "oldest" | "budget-high" | "budget-low" | "probability";

export const statusConfig: Record<string, { label: string; color: string; bg: string; icon: ReactNode }> = {
  new: { label: "New", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", icon: <Zap className="w-3.5 h-3.5" /> },
  analyzing: { label: "Analyzing", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <Brain className="w-3.5 h-3.5" /> },
  qualified: { label: "Qualified", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  proposal_sent: { label: "Proposal Sent", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: <Send className="w-3.5 h-3.5" /> },
  won: { label: "Won", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", icon: <Target className="w-3.5 h-3.5" /> },
};

export const urgencyConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
  medium: { label: "Medium", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
  high: { label: "High", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  critical: { label: "Critical", color: "bg-red-500/15 text-red-400 border-red-500/20" },
};

export const statusSummaryCards = [
  { key: "new", icon: <Zap className="w-5 h-5" />, color: "from-indigo-500 to-rose-600", glow: "shadow-indigo-500/25" },
  { key: "analyzing", icon: <Brain className="w-5 h-5" />, color: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25" },
  { key: "qualified", icon: <CheckCircle2 className="w-5 h-5" />, color: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25" },
  { key: "proposal_sent", icon: <Send className="w-5 h-5" />, color: "from-rose-500 to-rose-600", glow: "shadow-rose-500/25" },
  { key: "won", icon: <Target className="w-5 h-5" />, color: "from-indigo-500 to-rose-600", glow: "shadow-indigo-500/25" },
];

export const PAGE_SIZE = 9;
