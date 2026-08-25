"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import {
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Reply,
} from "lucide-react";

type LeadRow = {
  id: string;
  title: string;
  client_name: string;
  company: string;
  email: string;
  country: string;
  technologies: string[];
  budget_max: number;
  status: string;
  outreach_status: string;
  last_step: number;
  has_email: boolean;
  email_source?: string | null;
  email_verified?: boolean;
};

type CadenceStep = { day: number; channel: string; label: string; goal: string };
type RecordRow = {
  id: string;
  company: string;
  client_name: string;
  channel: string;
  step_label: string;
  status: string;
  simulated: boolean;
  subject: string;
  sent_at: string | null;
  replied_at: string | null;
};

function statusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Sent</Badge>;
    case "simulated":
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Simulated</Badge>;
    case "logged":
      return <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30">Logged</Badge>;
    case "replied":
      return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">Replied</Badge>;
    case "failed":
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/30">Failed</Badge>;
    default:
      return <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30">Not contacted</Badge>;
  }
}

const channelIcon: Record<string, any> = { email: Mail, linkedin: MessageSquare, whatsapp: MessageSquare };

export default function OutreachPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [cadence, setCadence] = useState<CadenceStep[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<LeadRow | null>(null);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };

  const loadAll = useCallback(async () => {
    const [l, c, r, s] = await Promise.all([
      api.outreach.leads(),
      api.outreach.cadence(),
      api.outreach.records(),
      api.outreach.stats(),
    ]);
    setLeads(l);
    setCadence(c.cadence || []);
    setRecords(r);
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.title = "Outreach | MBPW";
    loadAll();
  }, [loadAll]);

  const openLead = async (lead: LeadRow) => {
    setActive(lead);
    setStep(Math.max(0, (lead.last_step ?? -1) + 1));
    setEmail(lead.email || "");
    setCustomNote("");
    setPreview(null);
    const p = await api.outreach.preview({ lead_id: lead.id, step: Math.max(0, (lead.last_step ?? -1) + 1) });
    setPreview(p);
  };

  const changeStep = async (s: number) => {
    if (!active) return;
    setStep(s);
    const p = await api.outreach.preview({ lead_id: active.id, step: s, custom_note: customNote });
    setPreview(p);
  };

  const send = async () => {
    if (!active) return;
    if (!email.includes("@")) {
      showToast("Enter a real contact email to send.");
      return;
    }
    setSending(true);
    try {
      if (email !== active.email) {
        await api.leads.update(active.id, { email });
        active.email = email;
      }
      const res = await api.outreach.send({ lead_id: active.id, step, custom_note: customNote });
      showToast(
        res.simulated
          ? "Queued (simulated — set SMTP env vars to deliver for real)."
          : res.status === "sent"
          ? "Outreach email delivered."
          : "Outreach logged."
      );
      setActive(null);
      await loadAll();
    } catch (e: any) {
      showToast(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const markReply = async (id: string) => {
    await api.outreach.reply(id);
    showToast("Marked as replied — progressive win recorded.");
    await loadAll();
  };

  const enrichAll = async () => {
    setSending(true);
    try {
      const r = await api.outreach.enrichAll();
      showToast(`Enriched ${r.enriched} of ${r.checked} leads with contact emails.`);
      await loadAll();
    } catch (e: any) {
      showToast(e?.message || "Enrich failed");
    } finally {
      setSending(false);
    }
  };

  const enrichOne = async (l: LeadRow) => {
    try {
      const r = await api.outreach.enrich(l.id);
      showToast(r.email ? `Enriched ${l.company} → ${r.email}` : `No email found for ${l.company}`);
      await loadAll();
    } catch (e: any) {
      showToast(e?.message || "Enrich failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <div className="p-10 text-zinc-500">Loading outreach…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Send className="w-6 h-6 text-indigo-400" /> Outreach
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Authentic, progressive client outreach — personalized per lead, on a Day 0/3/7/14 cadence.
              </p>
            </div>

            {toast && (
              <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-sm text-white">{toast}</span>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { k: "Sent", v: stats?.sent ?? 0, c: "text-emerald-400" },
                { k: "Simulated", v: stats?.simulated ?? 0, c: "text-amber-400" },
                { k: "Replied", v: stats?.replied ?? 0, c: "text-rose-400" },
                { k: "Total", v: stats?.total ?? 0, c: "text-indigo-400" },
              ].map((s) => (
                <Card key={s.k} className="bg-zinc-900/60 border-white/[0.06]">
                  <CardContent className="p-5">
                    <div className="text-3xl font-bold text-white">{s.v}</div>
                    <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{s.k}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cadence */}
            <Card className="bg-zinc-900/60 border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Progressive Cadence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {cadence.map((c) => {
                    const Icon = channelIcon[c.channel] || Mail;
                    return (
                      <div key={c.day} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-semibold text-white">Day {c.day}</span>
                          <span className="text-[10px] uppercase text-zinc-500">{c.channel}</span>
                        </div>
                        <div className="text-sm font-medium text-white">{c.label}</div>
                        <div className="text-[11px] text-zinc-500 mt-1">{c.goal}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Leads to reach */}
            <Card className="bg-zinc-900/60 border-white/[0.06]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-white text-lg">Leads</CardTitle>
                  <Button
                    onClick={enrichAll}
                    disabled={sending}
                    className="bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] text-xs h-8 px-3"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1.5" /> Enrich all emails
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {leads.length === 0 && <div className="text-sm text-zinc-500">No leads yet. Sync a connector first.</div>}
                {leads.map((l) => (
                  <div key={l.id} className="flex items-center gap-4 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{l.company || l.client_name}</span>
                        {statusBadge(l.outreach_status)}
                        {l.email_source === "hunter" && (
                          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">verified</Badge>
                        )}
                        {l.email_source === "heuristic" && (
                          <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30">heuristic</Badge>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">{l.title}</div>
                      <div className="text-[11px] text-zinc-600 mt-0.5">
                        {l.email ? l.email : <span className="text-amber-500">no email — enrich to send</span>}
                        {l.technologies?.length ? ` · ${l.technologies.slice(0, 3).join(", ")}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        onClick={() => openLead(l)}
                        className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white text-xs h-9 px-3"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Reach out
                      </Button>
                      {!l.email && (
                        <Button
                          onClick={() => enrichOne(l)}
                          variant="ghost"
                          className="text-zinc-400 hover:text-white hover:bg-white/[0.06] text-xs h-8 px-3"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" /> Enrich
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Records */}
            <Card className="bg-zinc-900/60 border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Outreach History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {records.length === 0 && <div className="text-sm text-zinc-500">No outreach sent yet.</div>}
                {records.map((r) => {
                  const Icon = channelIcon[r.channel] || Mail;
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{r.company}</span>
                          {statusBadge(r.status)}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">{r.step_label} · {r.subject}</div>
                      </div>
                      {r.status !== "replied" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markReply(r.id)}
                          className="text-rose-400 hover:text-violet-300 hover:bg-rose-500/10 text-xs shrink-0"
                        >
                          <Reply className="w-3.5 h-3.5 mr-1.5" /> Reply
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Compose dialog */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" /> Authentic Outreach
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              {active?.company} — {active?.title}
            </DialogDescription>
          </DialogHeader>

          {active && preview && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                {cadence.map((c, i) => (
                  <button
                    key={c.day}
                    onClick={() => changeStep(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      i === step
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                    }`}
                  >
                    Day {c.day} · {c.channel}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">
                  Contact email
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="real-contact@company.com"
                  className="bg-white/[0.03] border-white/[0.08] text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-sm font-semibold text-white mb-1">{preview.subject}</div>
                <div className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {preview.body_text}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">
                  Personal note (optional)
                </label>
                <Textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Add a personal touch…"
                  className="bg-white/[0.03] border-white/[0.08] text-white"
                  rows={2}
                />
              </div>

              {!preview.recipient_email && (
                <div className="flex items-center gap-2 text-[11px] text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" /> No verified email on this lead — add one above to enable sending.
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  onClick={send}
                  disabled={sending}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-semibold h-11"
                >
                  <Send className="w-4 h-4 mr-2" /> {sending ? "Sending…" : "Send outreach"}
                </Button>
                <Button variant="ghost" onClick={() => setActive(null)} className="text-zinc-500 hover:text-white h-11 px-4">
                  Cancel
                </Button>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <Clock className="w-3.5 h-3.5" /> If SMTP isn&apos;t configured, sends are simulated (logged, not delivered). Set SMTP_* env vars to deliver for real.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
