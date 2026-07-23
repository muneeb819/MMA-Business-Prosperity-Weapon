"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { mockLeads } from "@/lib/mock-data";
import type { Lead } from "@/lib/types";
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Edit3,
  Copy,
  Download,
  Sparkles,
  TrendingUp,
  BarChart3,
  Target,
  Briefcase,
  Calendar,
  DollarSign,
  Zap,
  Brain,
  Lightbulb,
  Users,
  Globe,
  ArrowUpRight,
  Plus,
  LayoutTemplate,
  Eye,
  X,
} from "lucide-react";

const proposalStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
  submitted: { label: "Submitted", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  accepted: { label: "Accepted", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  revision: { label: "Revision", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

const toneOptions = [
  { value: "professional", label: "Professional", description: "Formal and business-oriented" },
  { value: "technical", label: "Technical", description: "Focus on technical expertise" },
  { value: "persuasive", label: "Persuasive", description: "Emphasis on value proposition" },
  { value: "collaborative", label: "Collaborative", description: "Partnership-focused approach" },
];

interface MockProposal {
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

const mockProposals: MockProposal[] = [
  {
    id: "prop-001",
    title: "Enterprise AI-Powered Analytics Platform",
    clientName: "Sarah Johnson",
    company: "TechVista Solutions",
    status: "submitted",
    winProbability: 82,
    budget: 185000,
    createdAt: "2026-07-20T10:00:00Z",
    submittedAt: "2026-07-22T14:30:00Z",
    sections: {
      coverLetter: `Dear Sarah,\n\nThank you for the opportunity to present our proposal for the Enterprise AI-Powered Analytics Platform. At MMA Business Prosperity Weapon, we understand the transformative potential of artificial intelligence in driving business intelligence.\n\nOur team has successfully delivered similar enterprise-scale analytics solutions for Fortune 500 companies, achieving an average 40% improvement in decision-making speed and 25% reduction in operational costs.\n\nWe are confident that our expertise in machine learning, data engineering, and cloud architecture positions us uniquely to deliver a solution that exceeds your expectations.\n\nBest regards,\nMMA Business Prosperity Weapon Team`,
      introduction: `MMA Business Prosperity Weapon is a leading technology consultancy specializing in AI-driven business solutions. With over 10 years of experience and a team of 50+ certified engineers, we have delivered 200+ successful projects across 30 countries.\n\nOur core competencies include:\n• Machine Learning & Deep Learning\n• Cloud-Native Architecture (AWS, Azure, GCP)\n• Real-Time Data Processing\n• Enterprise Integration\n• Security & Compliance\n\nWe bring a unique combination of technical excellence and business acumen to every engagement.`,
      technicalPlan: `Phase 1: Discovery & Architecture (4 weeks)\n- Stakeholder interviews and requirements gathering\n- System architecture design\n- Technology stack selection\n- Data source mapping\n\nPhase 2: Core Development (12 weeks)\n- Data pipeline construction\n- ML model development and training\n- Dashboard and visualization layer\n- API development and integration\n\nPhase 3: Advanced Features (8 weeks)\n- Predictive analytics engine\n- Natural language query interface\n- Automated reporting system\n- Mobile application\n\nPhase 4: Testing & Deployment (4 weeks)\n- Comprehensive QA testing\n- Performance optimization\n- Security audit\n- Production deployment and monitoring setup`,
      costEstimate: `Investment Breakdown:\n\n• Discovery & Architecture: $28,000\n• Core Development: $85,000\n• Advanced Features: $42,000\n• Testing & Deployment: $18,000\n• Project Management: $12,000\n\nTotal Investment: $185,000\n\nPayment Schedule:\n- 30% upon contract signing: $55,500\n- 30% at Phase 2 completion: $55,500\n- 25% at Phase 3 completion: $46,250\n- 15% upon final delivery: $27,750\n\nNote: This estimate includes a 10% contingency buffer.`,
      callToAction: `We are excited about the possibility of partnering with TechVista Solutions on this transformative initiative.\n\nNext Steps:\n1. Schedule a technical deep-dive session\n2. Finalize project scope and timeline\n3. Execute partnership agreement\n4. Kick off Phase 1\n\nOur team is available for a follow-up meeting at your earliest convenience. We can provide additional references, case studies, or technical demonstrations as needed.\n\nLooking forward to building something exceptional together.`,
    },
    portfolioSuggestions: ["AI Chatbot Implementation - GlobalTech", "Predictive Analytics Dashboard - FinServe Corp", "Cloud Migration & ML Pipeline - DataDrive Inc"],
  },
  {
    id: "prop-002",
    title: "Cloud Infrastructure Modernization",
    clientName: "Michael Chen",
    company: "Meridian Corp",
    status: "draft",
    winProbability: 65,
    budget: 120000,
    createdAt: "2026-07-21T09:00:00Z",
    sections: {
      coverLetter: `Dear Michael,\n\nWe propose a comprehensive cloud modernization strategy for Meridian Corp that will reduce infrastructure costs by 35% while improving scalability and reliability.\n\nOur approach leverages containerization, microservices architecture, and managed cloud services to build a future-proof infrastructure.`,
      introduction: `MMA Business Prosperity Weapon brings deep expertise in cloud-native transformations. Our certified architects have migrated over 100 enterprise workloads to modern cloud environments.`,
      technicalPlan: `Phase 1: Assessment & Planning (3 weeks)\nPhase 2: Containerization (6 weeks)\nPhase 3: Migration (8 weeks)\nPhase 4: Optimization (4 weeks)`,
      costEstimate: `Total Investment: $120,000\nBreakdown available in detailed pricing sheet.`,
      callToAction: `Ready to modernize your infrastructure? Let's schedule a technical assessment.`,
    },
    portfolioSuggestions: ["Kubernetes Migration - ScaleUp Inc", "Multi-Cloud Strategy - GlobalNet"],
  },
  {
    id: "prop-003",
    title: "E-Commerce Platform Rebuild",
    clientName: "Emma Williams",
    company: "ShopSphere",
    status: "accepted",
    winProbability: 95,
    budget: 95000,
    createdAt: "2026-07-15T11:00:00Z",
    submittedAt: "2026-07-17T10:00:00Z",
    sections: {
      coverLetter: `Dear Emma,\n\nWe are thrilled to present our proposal for rebuilding ShopSphere's e-commerce platform using cutting-edge technology that will deliver a 3x improvement in page load times and a 45% increase in conversion rates.`,
      introduction: `MMA Business Prosperity Weapon has built and optimized e-commerce platforms processing over $2B in annual transactions.`,
      technicalPlan: `Modern stack with Next.js, headless CMS, edge computing, and AI-powered personalization.`,
      costEstimate: `Total Investment: $95,000\nPhased payment over 4 milestones.`,
      callToAction: `Excited to build the future of ShopSphere's digital commerce experience.`,
    },
    portfolioSuggestions: ["Fashion E-Commerce - LuxeBrand", "B2B Marketplace - TradeConnect"],
  },
  {
    id: "prop-004",
    title: "Real-Time IoT Monitoring Dashboard",
    clientName: "David Park",
    company: "Industrial Edge",
    status: "submitted",
    winProbability: 73,
    budget: 145000,
    createdAt: "2026-07-18T08:30:00Z",
    submittedAt: "2026-07-20T16:00:00Z",
    sections: {
      coverLetter: `Dear David,\n\nIndustrial Edge's vision for real-time IoT monitoring aligns perfectly with our expertise in edge computing and real-time data visualization.`,
      introduction: `With experience in industrial IoT deployments across manufacturing, energy, and logistics sectors, we bring domain-specific knowledge to every engagement.`,
      technicalPlan: `Edge computing layer, real-time streaming pipeline, React dashboard, alerting system.`,
      costEstimate: `Total Investment: $145,000\nIncludes hardware consultation and deployment support.`,
      callToAction: `Let's revolutionize how Industrial Edge monitors and optimizes operations.`,
    },
    portfolioSuggestions: ["Smart Factory Dashboard - ManuTech", "Energy Grid Monitoring - PowerGrid Solutions"],
  },
];

export default function ProposalsPage() {
  const [selectedProposal, setSelectedProposal] = useState<MockProposal | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [genLeadId, setGenLeadId] = useState("");
  const [genTone, setGenTone] = useState("professional");
  const [genInstructions, setGenInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    const drafts = mockProposals.filter((p) => p.status === "draft").length;
    const submitted = mockProposals.filter((p) => p.status === "submitted").length;
    const accepted = mockProposals.filter((p) => p.status === "accepted").length;
    const avgWin = Math.round(mockProposals.reduce((sum, p) => sum + p.winProbability, 0) / mockProposals.length);
    return { drafts, submitted, accepted, avgWin, total: mockProposals.length };
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setIsGenerating(false);
    setShowGenerateDialog(false);
    setGenLeadId("");
    setGenTone("professional");
    setGenInstructions("");
  };

  return (
    <div className="flex h-screen bg-[#07080F]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total Proposals", value: stats.total, icon: <FileText className="w-5 h-5" />, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5 border-blue-500/20" },
              { label: "Drafts", value: stats.drafts, icon: <Edit3 className="w-5 h-5" />, color: "text-zinc-400", bg: "from-zinc-500/10 to-zinc-600/5 border-zinc-500/20" },
              { label: "Submitted", value: stats.submitted, icon: <Send className="w-5 h-5" />, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5 border-blue-500/20" },
              { label: "Accepted", value: stats.accepted, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20" },
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

          {/* Performance Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Card className="bg-gradient-to-br from-violet-500/[0.06] to-purple-600/[0.02] border-violet-500/15 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "350ms" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-400" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Avg. Win Rate</span>
                  </div>
                  <span className="text-lg font-bold text-violet-400">{stats.avgWin}%</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-1000" style={{ width: `${stats.avgWin}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/[0.06] to-green-600/[0.02] border-emerald-500/15 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "420ms" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Conversion</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">{stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0}%</span>
                </div>
                <p className="text-[11px] text-zinc-600">{stats.accepted} of {stats.total} proposals accepted</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/[0.06] to-orange-600/[0.02] border-amber-500/15 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "490ms" }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Pipeline Value</span>
                  </div>
                  <span className="text-lg font-bold text-amber-400">{formatCurrency(mockProposals.reduce((s, p) => s + p.budget, 0))}</span>
                </div>
                <p className="text-[11px] text-zinc-600">Across all active proposals</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Generate Button */}
          <div className="mt-6">
            <Button
              onClick={() => setShowGenerateDialog(true)}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 text-white font-semibold h-12 px-8 shadow-lg shadow-blue-500/25 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "560ms" }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI Generate Proposal
              <ArrowUpRight className="w-4 h-4 ml-2 opacity-60" />
            </Button>
          </div>

          {/* Proposal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pb-8">
            {mockProposals.map((proposal, i) => {
              const sCfg = proposalStatusConfig[proposal.status] || proposalStatusConfig.draft;
              const prob = proposal.winProbability;

              return (
                <div
                  key={proposal.id}
                  onClick={() => setSelectedProposal(proposal)}
                  className="card-hover group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/15 hover:bg-white/[0.05] transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 fill-mode-both"
                  style={{ animationDelay: `${600 + i * 80}ms` }}
                >
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-0.5", sCfg.bg, sCfg.color)}>
                        {proposal.status === "accepted" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {proposal.status === "submitted" && <Send className="w-3 h-3 mr-1" />}
                        {proposal.status === "draft" && <Edit3 className="w-3 h-3 mr-1" />}
                        {sCfg.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-zinc-600 text-[10px]">
                        <Clock className="w-3 h-3" />
{timeAgo(new Date(proposal.createdAt))}
                      </div>
                    </div>

                    {/* Title + Company */}
                    <h3 className="text-white font-semibold text-[15px] leading-tight mb-1 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {proposal.title}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-4">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{proposal.company}</span>
                      <span className="text-zinc-700">·</span>
                      <Users className="w-3.5 h-3.5" />
                      <span>{proposal.clientName}</span>
                    </div>

                    {/* Win Probability */}
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

                    {/* Budget + Dates */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatCurrency(proposal.budget)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {timeAgo(new Date(proposal.createdAt))}
                        </span>
                        {proposal.submittedAt && (
                          <span className="flex items-center gap-1 text-blue-400/60">
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

          {/* Proposal Detail Dialog */}
          <Dialog open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposal(null)}>
            <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-3xl max-h-[90vh] overflow-hidden p-0">
              {selectedProposal && (
                <>
                  <div className="relative p-6 pb-4 border-b border-white/[0.06]">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={cn("text-[11px] font-semibold border px-2.5 py-1", proposalStatusConfig[selectedProposal.status]?.bg, proposalStatusConfig[selectedProposal.status]?.color)}>
                          {proposalStatusConfig[selectedProposal.status]?.label}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(selectedProposal.budget)}
                          </div>
                        </div>
                      </div>
                      <DialogTitle className="text-white text-xl font-bold leading-tight">{selectedProposal.title}</DialogTitle>
                      <DialogDescription className="text-zinc-500 text-sm mt-1">
                        {selectedProposal.company} · {selectedProposal.clientName}
                      </DialogDescription>
                    </div>
                  </div>

                  <Tabs defaultValue="cover" className="flex flex-col">
                    <div className="px-6 pt-4 border-b border-white/[0.06]">
                      <TabsList className="bg-white/[0.03] p-1 h-auto flex-wrap gap-1">
                        {[
                          { value: "cover", label: "Cover Letter" },
                          { value: "intro", label: "Introduction" },
                          { value: "technical", label: "Technical Plan" },
                          { value: "cost", label: "Cost Estimate" },
                          { value: "cta", label: "Call to Action" },
                        ].map((tab) => (
                          <TabsTrigger key={tab.value} value={tab.value} className="text-xs data-[state=active]:bg-white/[0.1] data-[state=active]:text-white text-zinc-500 px-3 py-1.5">
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <ScrollArea className="max-h-[calc(90vh-360px)]">
                      {[
                        { value: "cover", key: "coverLetter" as const, icon: <FileText className="w-4 h-4" /> },
                        { value: "intro", key: "introduction" as const, icon: <Lightbulb className="w-4 h-4" /> },
                        { value: "technical", key: "technicalPlan" as const, icon: <Brain className="w-4 h-4" /> },
                        { value: "cost", key: "costEstimate" as const, icon: <DollarSign className="w-4 h-4" /> },
                        { value: "cta", key: "callToAction" as const, icon: <Target className="w-4 h-4" /> },
                      ].map((tab) => (
                        <TabsContent key={tab.value} value={tab.value} className="p-6 mt-0">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-blue-400">{tab.icon}</span>
                            <h3 className="text-white font-semibold text-sm">{tab.value === "cover" ? "Cover Letter" : tab.value === "intro" ? "Introduction" : tab.value === "technical" ? "Technical Approach" : tab.value === "cost" ? "Cost Estimate" : "Call to Action"}</h3>
                          </div>
                          <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            {selectedProposal.sections[tab.key]}
                          </div>
                        </TabsContent>
                      ))}
                    </ScrollArea>

                    {/* Portfolio Suggestions */}
                    {selectedProposal.portfolioSuggestions && selectedProposal.portfolioSuggestions.length > 0 && (
                      <div className="px-6 pb-4 border-t border-white/[0.06] pt-4">
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                          <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
                          Related Portfolio Projects
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProposal.portfolioSuggestions.map((item) => (
                            <Badge key={item} variant="outline" className="text-xs font-medium text-zinc-400 bg-white/[0.03] border-white/[0.08] px-3 py-1.5 cursor-pointer hover:bg-white/[0.06] hover:text-white transition-colors">
                              <Eye className="w-3 h-3 mr-1.5" />
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-6 pt-4 border-t border-white/[0.06] flex items-center gap-3">
                      {selectedProposal.status === "draft" && (
                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold h-11 shadow-lg shadow-blue-500/20">
                          <Send className="w-4 h-4 mr-2" />
                          Submit Proposal
                        </Button>
                      )}
                      <Button variant="outline" className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-11">
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button variant="outline" className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>
                  </Tabs>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* AI Generation Dialog */}
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-lg">
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
                {/* Lead Selector */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Select Lead</label>
                  <Select value={genLeadId} onValueChange={setGenLeadId}>
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white h-11">
                      <Briefcase className="w-4 h-4 mr-2 text-zinc-500" />
                      <SelectValue placeholder="Choose a lead to generate proposal for" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12131C] border-white/10">
                      {mockLeads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.title} — {lead.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tone Picker */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Proposal Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setGenTone(tone.value)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-300",
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

                {/* Additional Instructions */}
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
        </ScrollArea>
      </div>
    </div>
  );
}
