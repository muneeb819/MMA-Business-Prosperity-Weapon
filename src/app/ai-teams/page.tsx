"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  Bot, Users, Target, Send, Mail, MessageSquare, BarChart3, Activity,
  Play, Pause, Loader2, CheckCircle, AlertTriangle, Clock, TrendingUp,
  ChevronDown, ChevronUp, Zap, Shield, Briefcase, Eye, Sparkles,
  CircleDot, ArrowUpRight, MessageCircle, FileText, RefreshCw,
  Radar, Lock, Database, Gauge, Globe, ShieldCheck, ShieldAlert, XCircle,
} from "lucide-react";

interface Agent {
  id: string; name: string; role: string; team: string; status: string;
  avatar: string; description: string; tasksCompleted: number;
  currentTask: string; efficiency: number; reportsTo: string | null;
  manages: string[]; lastActive: string;
}

interface TeamData {
  id: string; name: string; tier: number; lead: Agent; agents: Agent[];
}

interface TeamSummary {
  totalAgents: number; active: number; idle: number; working: number;
  paused: number; averageEfficiency: number; totalTasksCompleted: number;
}

interface ActivityEvent {
  timestamp: string; agent_id: string; agent_name: string;
  action: string; details: string;
}

interface ChatMessage {
  role: "user" | "agent"; content: string; timestamp: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500", working: "bg-indigo-500", idle: "bg-amber-500", paused: "bg-zinc-500",
};
const STATUS_TEXT: Record<string, string> = {
  active: "Active", working: "Working", idle: "Idle", paused: "Paused",
};

export default function AITeamsPage() {
  const [data, setData] = useState<{ summary: TeamSummary; manager: Agent; teams: TeamData[] } | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({ hunting: true, outreach: true });
  const [showReport, setShowReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Supervisor state
  const [supervisorHealth, setSupervisorHealth] = useState<any>(null);
  const [supervisorScan, setSupervisorScan] = useState<any>(null);
  const [supervisorIssues, setSupervisorIssues] = useState<any>(null);
  const [scanRunning, setScanRunning] = useState(false);
  const [supervisorChat, setSupervisorChat] = useState<ChatMessage[]>([]);
  const [supervisorChatInput, setSupervisorChatInput] = useState("");
  const [supervisorChatLoading, setSupervisorChatLoading] = useState(false);
  const [showSupervisorChat, setShowSupervisorChat] = useState(false);
  const [supervisorExpanded, setSupervisorExpanded] = useState(true);
  const [actionRunning, setActionRunning] = useState<string | null>(null);
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [showQualityReport, setShowQualityReport] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, actRes] = await Promise.all([api.aiTeams.list(), api.aiTeams.activity(30)]);
      setData(teamsRes);
      setActivity(actRes.activity || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 15000); return () => clearInterval(t); }, [fetchData]);

  // Supervisor auto-scan on mount + every 60 seconds
  const fetchSupervisorData = useCallback(async () => {
    try {
      const [healthRes, issuesRes] = await Promise.all([
        api.aiTeams.supervisor.health(),
        api.aiTeams.supervisor.issues(),
      ]);
      setSupervisorHealth(healthRes);
      setSupervisorIssues(issuesRes);
    } catch {}
  }, []);

  useEffect(() => {
    fetchSupervisorData();
    const t = setInterval(fetchSupervisorData, 60000);
    return () => clearInterval(t);
  }, [fetchSupervisorData]);

  // Auto-run initial scan if no scan has been done yet
  useEffect(() => {
    if (supervisorHealth && supervisorHealth.totalScansCompleted === 0 && !scanRunning) {
      handleRunScan();
    }
  }, [supervisorHealth]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatAgent]);

  const handleChat = async (agentId: string) => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim(); setChatInput(""); setChatLoading(true);
    const msgs = chatMessages[agentId] || [];
    const userMsg: ChatMessage = { role: "user", content: msg, timestamp: new Date().toISOString() };
    setChatMessages(prev => ({ ...prev, [agentId]: [...msgs, userMsg] }));
    try {
      const res = await api.aiTeams.chat(agentId, msg);
      const agentMsg: ChatMessage = { role: "agent", content: res.response, timestamp: new Date().toISOString() };
      setChatMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), agentMsg] }));
    } catch {
      const errMsg: ChatMessage = { role: "agent", content: "Sorry, I couldn't process that right now.", timestamp: new Date().toISOString() };
      setChatMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), errMsg] }));
    } finally { setChatLoading(false); }
  };

  const handleToggle = async (agentId: string) => {
    setToggling(agentId);
    try { await api.aiTeams.toggle(agentId); await fetchData(); } finally { setToggling(null); }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true); setShowReport(true);
    try { const res = await api.aiTeams.dailyReport(); setReport(res); } finally { setReportLoading(false); }
  };

  const handleRunScan = async () => {
    setScanRunning(true);
    try {
      const scanRes = await api.aiTeams.supervisor.scan();
      setSupervisorScan(scanRes);
      const [healthRes, issuesRes] = await Promise.all([
        api.aiTeams.supervisor.health(),
        api.aiTeams.supervisor.issues(),
      ]);
      setSupervisorHealth(healthRes);
      setSupervisorIssues(issuesRes);
    } catch {} finally { setScanRunning(false); }
  };

  const handleSupervisorChat = async () => {
    if (!supervisorChatInput.trim() || supervisorChatLoading) return;
    const msg = supervisorChatInput.trim(); setSupervisorChatInput(""); setSupervisorChatLoading(true);
    const userMsg: ChatMessage = { role: "user", content: msg, timestamp: new Date().toISOString() };
    setSupervisorChat(prev => [...prev, userMsg]);
    try {
      const res = await api.aiTeams.supervisor.chat(msg);
      const agentMsg: ChatMessage = { role: "agent", content: res.response, timestamp: new Date().toISOString() };
      setSupervisorChat(prev => [...prev, agentMsg]);
    } catch {
      const errMsg: ChatMessage = { role: "agent", content: "Quality Sentinel could not process that request.", timestamp: new Date().toISOString() };
      setSupervisorChat(prev => [...prev, errMsg]);
    } finally { setSupervisorChatLoading(false); }
  };

  const handleSupervisorAction = async (action: string, apiCall: () => Promise<any>) => {
    setActionRunning(action);
    try {
      const res = await apiCall();
      const userMsg: ChatMessage = { role: "user", content: `[ACTION] ${action}`, timestamp: new Date().toISOString() };
      const agentMsg: ChatMessage = { role: "agent", content: res.summary || JSON.stringify(res, null, 2), timestamp: new Date().toISOString() };
      setSupervisorChat(prev => [...prev, userMsg, agentMsg]);
      setShowSupervisorChat(true);
      const [healthRes, issuesRes] = await Promise.all([api.aiTeams.supervisor.health(), api.aiTeams.supervisor.issues()]);
      setSupervisorHealth(healthRes);
      setSupervisorIssues(issuesRes);
    } catch {} finally { setActionRunning(null); }
  };

  const handleGenerateQualityReport = async () => {
    setActionRunning("report");
    try {
      const report = await api.aiTeams.supervisor.report();
      setQualityReport(report);
      setShowQualityReport(true);
    } catch {} finally { setActionRunning(null); }
  };

  const QUICK_QUESTIONS: Record<string, string[]> = {
    manager: ["Give me today's report", "How are both teams performing?", "Any bottlenecks today?", "Who is the top performer?"],
    hunting: ["How many leads found today?", "Which sources are performing best?", "Any issues with the hunters?"],
    outreach: ["How many proposals sent?", "What's our response rate?", "Any emails bounced?"],
    supervisor: [
      "Run a full system health check",
      "What are the critical issues right now?",
      "Run a data reconciliation sweep",
      "Run a security audit",
      "Check API response times and performance",
      "Redistribute agent workload",
      "Generate a full quality report",
      "How is lead quality across industries?",
      "What do you recommend I fix first?",
      "Compare system metrics over time",
      "Tell me about yourself",
    ],
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading AI Teams...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-zinc-400">Failed to load AI Teams. Backend may be starting up.</p>
        <Button onClick={fetchData} variant="outline" className="mt-4 border-white/10 text-zinc-400">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    </div>
  );

  const { summary, manager, teams } = data;
  const huntingTeam = teams.find(t => t.id === "hunting");
  const outreachTeam = teams.find(t => t.id === "outreach");

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Breadcrumbs />
            <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/20 border border-rose-500/20">
              <Users className="w-6 h-6 text-rose-400" />
            </div>
            AI Teams Command Center
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{summary?.totalAgents ?? 16} AI agents working across 3 tiers to find and convert leads</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">{summary.active}/{summary.totalAgents} Online</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-zinc-500">{summary.totalTasksCompleted} tasks done</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-zinc-500">{summary.averageEfficiency}% avg efficiency</span>
          </div>
        </div>
      </div>

      {/* ═══ SUPERVISOR COMMAND CENTER ═══ */}
      <div className="relative rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.04] via-amber-500/[0.02] to-orange-500/[0.04] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-red-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/[0.03] rounded-full blur-3xl" />

        {/* Supervisor Header */}
        <div className="relative flex flex-col lg:flex-row gap-6 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/30 to-amber-500/30 border border-red-500/30 flex items-center justify-center text-3xl shadow-lg shadow-red-500/10">
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Quality Sentinel</h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/20">SUPERVISOR</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">Always On</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm">Perpetual Quality & Testing Supervisor — monitors the entire system 24/7</p>
              </div>
            </div>

            {/* Health Score + Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] text-zinc-600 uppercase">Health</span>
                </div>
                <p className={cn("text-2xl font-bold",
                  (supervisorHealth?.healthScore || 0) >= 90 ? "text-emerald-400" :
                  (supervisorHealth?.healthScore || 0) >= 70 ? "text-amber-400" : "text-red-400"
                )}>{supervisorHealth?.healthScore || 0}%</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Radar className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] text-zinc-600 uppercase">Scans</span>
                </div>
                <p className="text-2xl font-bold text-white">{supervisorHealth?.totalScansCompleted || 0}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] text-zinc-600 uppercase">Critical</span>
                </div>
                <p className="text-2xl font-bold text-red-400">{supervisorHealth?.criticalIssues || 0}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-zinc-600 uppercase">Warnings</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">{supervisorIssues?.warnings || 0}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-zinc-600 uppercase">Agents OK</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{supervisorHealth?.agentsOnline || 0}/{supervisorHealth?.agentsTotal || 0}</p>
              </div>
            </div>
          </div>

          {/* Supervisor Actions */}
          <div className="lg:w-80 flex flex-col gap-2">
            <Button onClick={handleRunScan} disabled={scanRunning}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold h-11 shadow-lg shadow-red-500/20">
              {scanRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Radar className="w-4 h-4 mr-2" />}
              {scanRunning ? "Scanning..." : "Run Full System Scan"}
            </Button>
            <Button onClick={handleGenerateQualityReport} disabled={actionRunning === "report"}
              className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold h-11 shadow-lg shadow-emerald-500/20">
              {actionRunning === "report" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {actionRunning === "report" ? "Generating..." : "Generate Quality Report"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => handleSupervisorAction("Data Reconciliation", api.aiTeams.supervisor.reconcile)}
                disabled={!!actionRunning} variant="outline"
                className="border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10 h-9 text-xs">
                {actionRunning === "Data Reconciliation" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Database className="w-3 h-3 mr-1" />}
                Reconcile
              </Button>
              <Button onClick={() => handleSupervisorAction("Security Audit", api.aiTeams.supervisor.securityAudit)}
                disabled={!!actionRunning} variant="outline"
                className="border-amber-500/20 text-amber-300 hover:bg-amber-500/10 h-9 text-xs">
                {actionRunning === "Security Audit" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Lock className="w-3 h-3 mr-1" />}
                Security
              </Button>
              <Button onClick={() => handleSupervisorAction("Performance Check", api.aiTeams.supervisor.performanceCheck)}
                disabled={!!actionRunning} variant="outline"
                className="border-rose-500/20 text-violet-300 hover:bg-rose-500/10 h-9 text-xs">
                {actionRunning === "Performance Check" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Gauge className="w-3 h-3 mr-1" />}
                Performance
              </Button>
              <Button onClick={() => handleSupervisorAction("Agent Redistribution", api.aiTeams.supervisor.redistribute)}
                disabled={!!actionRunning} variant="outline"
                className="border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 h-9 text-xs">
                {actionRunning === "Agent Redistribution" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Users className="w-3 h-3 mr-1" />}
                Redistribute
              </Button>
            </div>
            <Button onClick={() => setShowSupervisorChat(!showSupervisorChat)}
              variant="outline" className="border-red-500/20 text-red-300 hover:bg-red-500/10 h-11">
              <MessageCircle className="w-4 h-4 mr-2" /> Chat with Sentinel
            </Button>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 mt-1">
              <Clock className="w-3 h-3" />
              <span>Last scan: {supervisorHealth?.lastScanTime ? new Date(supervisorHealth.lastScanTime).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>
        </div>

        {/* Health Categories Grid */}
        {supervisorExpanded && supervisorHealth?.categories && (
          <div className="relative mb-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">System Health Categories</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { key: "agentHealth", label: "Agent Health", icon: Users, ok: "healthy" },
                { key: "dataIntegrity", label: "Data Integrity", icon: Database, ok: "healthy" },
                { key: "leadQuality", label: "Lead Quality", icon: Target, ok: "healthy" },
                { key: "outreachQuality", label: "Outreach", icon: Mail, ok: "healthy" },
                { key: "pipeline", label: "Pipeline", icon: Activity, ok: "healthy" },
                { key: "security", label: "Security", icon: Lock, ok: "healthy" },
                { key: "performance", label: "Performance", icon: Gauge, ok: "healthy" },
              ].map((cat) => {
                const status = supervisorHealth.categories[cat.key] || "unknown";
                const isOk = status === cat.ok;
                return (
                  <div key={cat.key} className={cn(
                    "rounded-xl border p-2.5 text-center transition-all",
                    isOk ? "bg-emerald-500/[0.04] border-emerald-500/10" :
                    status === "warning" ? "bg-amber-500/[0.04] border-amber-500/10" :
                    "bg-red-500/[0.04] border-red-500/10"
                  )}>
                    <cat.icon className={cn("w-4 h-4 mx-auto mb-1",
                      isOk ? "text-emerald-400" : status === "warning" ? "text-amber-400" : "text-red-400"
                    )} />
                    <p className="text-[10px] text-zinc-400 font-medium">{cat.label}</p>
                    <p className={cn("text-[10px] font-semibold capitalize mt-0.5",
                      isOk ? "text-emerald-400" : status === "warning" ? "text-amber-400" : "text-red-400"
                    )}>{status}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Scan Results */}
        {supervisorExpanded && supervisorScan && (
          <div className="relative mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Radar className="w-3 h-3 text-indigo-400" /> Latest Scan #{supervisorScan.scanId}
              </p>
              <span className="text-[10px] text-zinc-600">{new Date(supervisorScan.timestamp).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
                <p className={cn("text-lg font-bold",
                  supervisorScan.healthScore >= 90 ? "text-emerald-400" :
                  supervisorScan.healthScore >= 70 ? "text-amber-400" : "text-red-400"
                )}>{supervisorScan.healthScore}%</p>
                <p className="text-[9px] text-zinc-600 uppercase">Score</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
                <p className="text-lg font-bold text-emerald-400">{supervisorScan.checksPassed}/{supervisorScan.checksTotal}</p>
                <p className="text-[9px] text-zinc-600 uppercase">Checks Passed</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
                <p className="text-lg font-bold text-indigo-400">{supervisorScan.agentSummary?.activeAgents || 0}</p>
                <p className="text-[9px] text-zinc-600 uppercase">Active Agents</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
                <p className="text-lg font-bold text-amber-400">{supervisorScan.agentSummary?.avgEfficiency || 0}%</p>
                <p className="text-[9px] text-zinc-600 uppercase">Avg Efficiency</p>
              </div>
            </div>
            {supervisorScan.agentSummary && (
              <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                <span>Top performer: <span className="text-emerald-400 font-medium">{supervisorScan.agentSummary.highestEfficiencyAgent}</span></span>
                <span>Needs attention: <span className="text-amber-400 font-medium">{supervisorScan.agentSummary.lowestEfficiencyAgent}</span></span>
              </div>
            )}
          </div>
        )}

        {/* Issues Feed */}
        {supervisorExpanded && supervisorIssues && supervisorIssues.count > 0 && (
          <div className="relative">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-500" /> Open Issues ({supervisorIssues.count})
            </p>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {supervisorIssues.issues.map((issue: any) => (
                <div key={issue.id} className={cn(
                  "rounded-xl border p-3 transition-all",
                  issue.severity === "critical" ? "bg-red-500/[0.04] border-red-500/10" :
                  issue.severity === "warning" ? "bg-amber-500/[0.04] border-amber-500/10" :
                  "bg-white/[0.02] border-white/[0.06]"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0",
                      issue.severity === "critical" ? "bg-red-500 animate-pulse" :
                      issue.severity === "warning" ? "bg-amber-500" : "bg-indigo-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                          issue.severity === "critical" ? "bg-red-500/20 text-red-300" :
                          issue.severity === "warning" ? "bg-amber-500/20 text-amber-300" :
                          "bg-indigo-500/20 text-indigo-300"
                        )}>{issue.severity}</span>
                        <span className="text-[10px] text-zinc-600">{issue.category}</span>
                      </div>
                      <p className="text-sm text-white font-medium">{issue.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{issue.detail}</p>
                      {issue.suggestion && (
                        <p className="text-[11px] text-indigo-400/70 mt-1 italic">Suggestion: {issue.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Issues */}
        {supervisorExpanded && supervisorIssues && supervisorIssues.count === 0 && supervisorHealth?.totalScansCompleted > 0 && (
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm text-emerald-300 font-medium">All Systems Operational</p>
              <p className="text-[11px] text-zinc-500">No issues detected. The Quality Sentinel is continuously monitoring.</p>
            </div>
          </div>
        )}

        {/* Supervisor Chat */}
        {showSupervisorChat && (
          <div className="relative mt-5 rounded-xl border border-red-500/10 bg-black/20 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-zinc-400">Quality Sentinel is online — ask anything about system health</span>
            </div>
            <ScrollArea className="h-[280px] p-4">
              {supervisorChat.length === 0 && (
                <div className="text-center py-6">
                  <Shield className="w-10 h-10 text-red-500/30 mx-auto mb-2" />
                  <p className="text-zinc-600 text-xs mb-3">Ask the Quality Sentinel about system health, issues, or run diagnostics</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {(QUICK_QUESTIONS.supervisor || []).map((q) => (
                      <button key={q} onClick={() => setSupervisorChatInput(q)}
                        className="px-2.5 py-1 text-[10px] rounded-lg bg-red-500/10 text-red-300/70 border border-red-500/10 hover:bg-red-500/20 transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {supervisorChat.map((m, i) => (
                <div key={i} className={cn("mb-3 flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    m.role === "user" ? "bg-red-500/20 text-red-100" : "bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                  )}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p className="text-[9px] text-zinc-600 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {supervisorChatLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-red-400 animate-spin" />
                    <span className="text-xs text-zinc-500">Analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </ScrollArea>
            <div className="px-4 py-3 border-t border-white/[0.04] flex gap-2">
              <input value={supervisorChatInput} onChange={(e) => setSupervisorChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSupervisorChat()}
                placeholder="Ask the Quality Sentinel..."
                className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500/40" />
              <Button onClick={handleSupervisorChat} disabled={!supervisorChatInput.trim() || supervisorChatLoading}
                size="sm" className="bg-red-600 hover:bg-red-500 text-white rounded-xl px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ QUALITY REPORT DIALOG ═══ */}
      {showQualityReport && qualityReport && (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-indigo-500/[0.01] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Comprehensive Quality Report — #{qualityReport.reportId}
            </h3>
            <button onClick={() => setShowQualityReport(false)} className="text-zinc-600 hover:text-white text-sm">Close</button>
          </div>
          <div className="text-[10px] text-zinc-600 mb-4">Generated: {qualityReport.generatedAt}</div>

          {/* Overall Score */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center col-span-1">
              <p className={cn("text-3xl font-bold",
                qualityReport.overallScore >= 90 ? "text-emerald-400" : qualityReport.overallScore >= 70 ? "text-amber-400" : "text-red-400"
              )}>{qualityReport.overallScore}%</p>
              <p className="text-[10px] text-zinc-600 uppercase">Overall Score</p>
              <p className={cn("text-[10px] font-semibold uppercase",
                qualityReport.overallStatus === "operational" ? "text-emerald-400" : "text-amber-400"
              )}>{qualityReport.overallStatus}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-indigo-400">{qualityReport.sections?.healthScan?.score}%</p>
              <p className="text-[10px] text-zinc-600 uppercase">Health Scan</p>
              <p className="text-[10px] text-zinc-500">{qualityReport.sections?.healthScan?.checksPassed}/{qualityReport.sections?.healthScan?.checksTotal} passed</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-rose-400">{qualityReport.sections?.dataReconciliation?.score}%</p>
              <p className="text-[10px] text-zinc-600 uppercase">Data Recon</p>
              <p className="text-[10px] text-zinc-500">{qualityReport.sections?.dataReconciliation?.checksPassed}/{qualityReport.sections?.dataReconciliation?.checksTotal} passed</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{qualityReport.sections?.securityAudit?.score}%</p>
              <p className="text-[10px] text-zinc-600 uppercase">Security</p>
              <p className="text-[10px] text-zinc-500">{qualityReport.sections?.securityAudit?.checksPassed}/{qualityReport.sections?.securityAudit?.checksTotal} passed</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{qualityReport.sections?.performanceCheck?.score}%</p>
              <p className="text-[10px] text-zinc-600 uppercase">Performance</p>
              <p className="text-[10px] text-zinc-500">{qualityReport.sections?.performanceCheck?.checksPassed}/{qualityReport.sections?.performanceCheck?.checksTotal} passed</p>
            </div>
          </div>

          {/* Section Details */}
          {["dataReconciliation", "securityAudit", "performanceCheck"].map((section) => {
            const data = qualityReport.sections?.[section];
            if (!data) return null;
            const titles: Record<string, string> = { dataReconciliation: "Data Reconciliation", securityAudit: "Security Audit", performanceCheck: "Performance Check" };
            const colors: Record<string, string> = { dataReconciliation: "violet", securityAudit: "amber", performanceCheck: "cyan" };
            const sectionColorClass: Record<string, string> = { dataReconciliation: "text-rose-400", securityAudit: "text-amber-400", performanceCheck: "text-indigo-400" };
            return (
              <div key={section} className="mb-4">
                <p className={cn("text-xs uppercase tracking-wider font-semibold mb-2", sectionColorClass[section])}>{titles[section]}</p>
                <div className="space-y-1">
                  {(data.findings || []).map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] text-xs">
                      <span>{f.status === "pass" ? "✅" : f.status === "warn" ? "⚠️" : "❌"}</span>
                      <span className="font-medium text-white">{f.check}</span>
                      <span className="text-zinc-500 flex-1 truncate">{f.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Team Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <p className="text-xs text-indigo-400 font-semibold mb-1">Hunting Team</p>
              <p className="text-sm text-white">{qualityReport.teamSummary?.hunting?.agents} agents | {qualityReport.teamSummary?.hunting?.avgEfficiency}% efficiency | {qualityReport.teamSummary?.hunting?.totalTasks} tasks</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <p className="text-xs text-rose-400 font-semibold mb-1">Outreach Team</p>
              <p className="text-sm text-white">{qualityReport.teamSummary?.outreach?.agents} agents | {qualityReport.teamSummary?.outreach?.avgEfficiency}% efficiency | {qualityReport.teamSummary?.outreach?.totalTasks} tasks</p>
            </div>
          </div>
        </div>
      )}

      {/* Manager Card */}
      <div className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] to-orange-500/[0.02] p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/[0.03] rounded-full blur-3xl" />
        <div className="relative flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                {manager.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{manager.name}</h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/20">DIRECTOR</span>
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", STATUS_COLORS[manager.status])} />
                </div>
                <p className="text-zinc-500 text-sm">{manager.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Tasks Done", value: manager.tasksCompleted, icon: CheckCircle, color: "text-emerald-400" },
                { label: "Efficiency", value: `${manager.efficiency}%`, icon: TrendingUp, color: "text-indigo-400" },
                { label: "Teams Managed", value: 2, icon: Shield, color: "text-rose-400" },
                { label: "Agents Oversight", value: 12, icon: Users, color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <stat.icon className={cn("w-4 h-4 mb-1", stat.color)} />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-80 flex flex-col gap-2">
            <Button onClick={handleGenerateReport} disabled={reportLoading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold h-11 shadow-lg shadow-amber-500/20">
              {reportLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Daily Report
            </Button>
            <Button onClick={() => setChatAgent(chatAgent === manager.id ? null : manager.id)}
              variant="outline" className="border-amber-500/20 text-amber-300 hover:bg-amber-500/10 h-11">
              <MessageCircle className="w-4 h-4 mr-2" /> Chat with Director
            </Button>
          </div>
        </div>

        {/* Manager Chat */}
        {chatAgent === manager.id && (
          <div className="mt-4 rounded-xl border border-amber-500/10 bg-black/20 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs text-zinc-400">Director AI is online</span>
            </div>
            <ScrollArea className="h-[280px] p-4">
              {(chatMessages[manager.id] || []).length === 0 && (
                <div className="text-center py-6">
                  <Bot className="w-10 h-10 text-amber-500/30 mx-auto mb-2" />
                  <p className="text-zinc-600 text-xs mb-3">Ask the Director anything about operations</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {(QUICK_QUESTIONS.manager || []).map((q) => (
                      <button key={q} onClick={() => { setChatInput(q); }}
                        className="px-2.5 py-1 text-[10px] rounded-lg bg-amber-500/10 text-amber-300/70 border border-amber-500/10 hover:bg-amber-500/20 transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(chatMessages[manager.id] || []).map((m, i) => (
                <div key={i} className={cn("mb-3 flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    m.role === "user" ? "bg-amber-500/20 text-amber-100" : "bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                  )}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p className="text-[9px] text-zinc-600 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="text-xs text-zinc-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </ScrollArea>
            <div className="px-4 py-3 border-t border-white/[0.04] flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat(manager.id)}
                placeholder="Ask the Director..."
                className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/40" />
              <Button onClick={() => handleChat(manager.id)} disabled={!chatInput.trim() || chatLoading}
                size="sm" className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {huntingTeam && (
          <TeamSection team={huntingTeam} expanded={!!expandedTeams.hunting}
            onToggle={() => setExpandedTeams(p => ({ ...p, hunting: !p.hunting }))}
            chatAgent={chatAgent} setChatAgent={setChatAgent} chatMessages={chatMessages}
            chatInput={chatInput} setChatInput={setChatInput} chatLoading={chatLoading}
            handleChat={handleChat} handleToggle={handleToggle} toggling={toggling}
            quickQuestions={QUICK_QUESTIONS.hunting} chatEndRef={chatEndRef} color="cyan" />
        )}
        {outreachTeam && (
          <TeamSection team={outreachTeam} expanded={!!expandedTeams.outreach}
            onToggle={() => setExpandedTeams(p => ({ ...p, outreach: !p.outreach }))}
            chatAgent={chatAgent} setChatAgent={setChatAgent} chatMessages={chatMessages}
            chatInput={chatInput} setChatInput={setChatInput} chatLoading={chatLoading}
            handleChat={handleChat} handleToggle={handleToggle} toggling={toggling}
            quickQuestions={QUICK_QUESTIONS.outreach} chatEndRef={chatEndRef} color="violet" />
        )}
      </div>

      {/* Daily Report */}
      {showReport && report && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.01] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" /> Daily Report — {report.date}
            </h3>
            <button onClick={() => setShowReport(false)} className="text-zinc-600 hover:text-white text-sm">Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-indigo-400">{report.leadsFoundToday?.total || 0}</p>
              <p className="text-[10px] text-zinc-600 uppercase">Leads Found</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-rose-400">{report.emailsSent || 0}</p>
              <p className="text-[10px] text-zinc-600 uppercase">Emails Sent</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{report.proposalsGenerated || 0}</p>
              <p className="text-[10px] text-zinc-600 uppercase">Proposals</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{report.teamEfficiency?.overall || 0}%</p>
              <p className="text-[10px] text-zinc-600 uppercase">Efficiency</p>
            </div>
          </div>
          {report.leadsFoundToday?.byAgent?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Hunter Performance</p>
              <div className="space-y-1.5">
                {report.leadsFoundToday.byAgent.map((h: any) => (
                  <div key={h.agentId} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/[0.02]">
                    <span className="text-sm">{h.agentName}</span>
                    <span className="text-[10px] text-zinc-600 ml-auto">{h.channel}</span>
                    <span className="text-xs font-semibold text-indigo-400">{h.count} leads</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {report.issues?.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Issues & Blockers
              </p>
              {report.issues.map((issue: string, i: number) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/10 mb-1">
                  <CircleDot className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-xs text-zinc-400">{issue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Feed */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-400" /> Live Activity Feed
        </h3>
        <ScrollArea className="max-h-[300px]">
          {activity.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">No activity yet</p>
          ) : (
            <div className="space-y-1.5">
              {activity.slice(0, 20).map((evt, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className={cn("h-2 w-2 rounded-full shrink-0",
                    evt.action === "chat" ? "bg-amber-500" :
                    evt.action === "paused" ? "bg-red-500" :
                    evt.action === "resumed" ? "bg-emerald-500" : "bg-indigo-500"
                  )} />
                  <span className="text-sm text-zinc-300 truncate flex-1">
                    <span className="font-medium text-white">{evt.agent_name}</span>
                    {" "}{evt.action} — {evt.details}
                  </span>
                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
    </div>
    </main>
    </div>
    </div>
  );
}

/* ─── Team Section Sub-component ─── */
function TeamSection({
  team, expanded, onToggle, chatAgent, setChatAgent, chatMessages,
  chatInput, setChatInput, chatLoading, handleChat, handleToggle, toggling,
  quickQuestions, chatEndRef, color,
}: {
  team: TeamData; expanded: boolean; onToggle: () => void;
  chatAgent: string | null; setChatAgent: (id: string | null) => void;
  chatMessages: Record<string, ChatMessage[]>; chatInput: string;
  setChatInput: (v: string) => void; chatLoading: boolean;
  handleChat: (id: string) => void; handleToggle: (id: string) => void;
  toggling: string | null; quickQuestions: string[];
  chatEndRef: React.RefObject<HTMLDivElement | null>; color: string;
}) {
  const teamEff = team.agents.length > 0
    ? Math.round(team.agents.reduce((s, a) => s + a.efficiency, 0) / team.agents.length)
    : 0;
  const teamTasks = team.agents.reduce((s, a) => s + a.tasksCompleted, 0);
  const colorMap: Record<string, { gradient: string; border: string; text: string; bg: string; shadow: string }> = {
    cyan: { gradient: "from-indigo-500 to-rose-500", border: "border-indigo-500/20", text: "text-indigo-400", bg: "bg-indigo-500/[0.04]", shadow: "shadow-indigo-500/10" },
    violet: { gradient: "from-rose-500 to-rose-500", border: "border-rose-500/20", text: "text-rose-400", bg: "bg-rose-500/[0.04]", shadow: "shadow-rose-500/10" },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={cn("rounded-2xl border overflow-hidden", c.border, c.bg)}>
      {/* Team Lead Header */}
      <div className="p-5 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onToggle} className="text-zinc-500 hover:text-white transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className="text-2xl">{team.lead.avatar}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{team.name}</h3>
                <span className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full border", c.border, c.text, c.bg)}>
                  LEAD
                </span>
              </div>
              <p className="text-xs text-zinc-500">{team.lead.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", STATUS_COLORS[team.lead.status])} />
            <Button onClick={() => setChatAgent(chatAgent === team.lead.id ? null : team.lead.id)}
              size="sm" variant="outline" className={cn("border-white/10 text-zinc-400 h-8 text-xs")}>
              <MessageCircle className="w-3 h-3 mr-1" /> Chat
            </Button>
            <Button onClick={() => handleToggle(team.lead.id)} size="sm" variant="ghost"
              className="h-8 w-8 p-0 text-zinc-500 hover:text-white" disabled={toggling === team.lead.id}>
              {toggling === team.lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                team.lead.status === "paused" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
            <p className="text-sm font-bold text-white">{teamTasks}</p>
            <p className="text-[9px] text-zinc-600 uppercase">Tasks Done</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
            <p className={cn("text-sm font-bold", c.text)}>{teamEff}%</p>
            <p className="text-[9px] text-zinc-600 uppercase">Efficiency</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2 text-center">
            <p className="text-sm font-bold text-white">{team.agents.filter(a => a.status === "working" || a.status === "active").length}/{team.agents.length}</p>
            <p className="text-[9px] text-zinc-600 uppercase">Active</p>
          </div>
        </div>
      </div>

      {/* Team Lead Chat */}
      {chatAgent === team.lead.id && (
        <div className="border-b border-white/[0.04] bg-black/10">
          <ScrollArea className="h-[240px] p-4">
            {(chatMessages[team.lead.id] || []).length === 0 && (
              <div className="text-center py-4">
                <p className="text-zinc-600 text-xs mb-2">Ask about your {team.id} team</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickQuestions.map((q) => (
                    <button key={q} onClick={() => setChatInput(q)}
                      className="px-2 py-1 text-[10px] rounded-lg bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06] transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(chatMessages[team.lead.id] || []).map((m, i) => (
              <div key={i} className={cn("mb-2 flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.role === "user" ? "bg-white/10 text-white" : "bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                )}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start mb-2">
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: color === "cyan" ? "#22d3ee" : "#a78bfa" }} />
                  <span className="text-xs text-zinc-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </ScrollArea>
          <div className="px-4 py-2 border-t border-white/[0.04] flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat(team.lead.id)}
              placeholder={`Ask ${team.lead.name}...`}
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/20" />
            <Button onClick={() => handleChat(team.lead.id)} disabled={!chatInput.trim() || chatLoading}
              size="sm" className="bg-white/10 hover:bg-white/15 text-white rounded-xl px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Agent Cards */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onToggle={handleToggle}
              toggling={toggling === agent.id} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Agent Card Sub-component ─── */
function AgentCard({ agent, onToggle, toggling, color }: {
  agent: Agent; onToggle: (id: string) => void; toggling: boolean; color: string;
}) {
  const colorMap: Record<string, string> = { cyan: "text-indigo-400", violet: "text-rose-400" };
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 hover:bg-white/[0.04] transition-all group">
      <div className="flex items-start gap-3 mb-2.5">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xl shrink-0">
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_COLORS[agent.status])} />
          </div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{STATUS_TEXT[agent.status]}</p>
        </div>
        <Button onClick={() => onToggle(agent.id)} size="sm" variant="ghost"
          className="h-7 w-7 p-0 text-zinc-500 hover:text-white opacity-70 hover:opacity-100 transition-opacity"
          disabled={toggling}>
          {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> :
            agent.status === "paused" ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </Button>
      </div>
      <p className="text-[11px] text-zinc-500 mb-2 line-clamp-1">{agent.currentTask}</p>
      <div className="flex items-center justify-between text-[10px] mb-1.5">
        <span className="text-zinc-600">{agent.tasksCompleted} tasks</span>
        <span className={cn("font-semibold", colorMap[color] || "text-zinc-400")}>{agent.efficiency}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
        <div className={cn("h-full rounded-full transition-all",
          color === "cyan" ? "bg-gradient-to-r from-indigo-500 to-rose-500" : "bg-gradient-to-r from-rose-500 to-rose-500"
        )} style={{ width: `${agent.efficiency}%` }} />
      </div>
    </div>
  );
}
