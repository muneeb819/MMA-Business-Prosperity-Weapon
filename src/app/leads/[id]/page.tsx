"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Tag,
  FileText,
} from "lucide-react"
import { api } from "@/lib/api"
import type { Lead, LeadStatus, UrgencyLevel, RiskLevel } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  analyzing: { label: "Analyzing", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  qualified: { label: "Qualified", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  proposal_sent: { label: "Proposal Sent", className: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  negotiation: { label: "Negotiation", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  won: { label: "Won", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  lost: { label: "Lost", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  archived: { label: "Archived", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
}

const urgencyConfig: Record<UrgencyLevel, string> = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
}

const riskConfig: Record<RiskLevel, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  very_high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
}

function fmtMoney(n: number | undefined) {
  if (!n) return "—"
  return "$" + n.toLocaleString()
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
        <div className="text-slate-200 break-words">{children}</div>
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enriching, setEnriching] = useState(false)
  const [enrichMsg, setEnrichMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const d = await api.leads.get(id)
      setLead(d)
    } catch (e: any) {
      setError(e?.message || "Failed to load lead")
      setLead(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const enrich = async () => {
    if (!id) return
    setEnriching(true)
    setEnrichMsg(null)
    try {
      await api.outreach.enrich(id)
      await load()
      setEnrichMsg("Email refreshed.")
    } catch (e: any) {
      setEnrichMsg(e?.message || "Enrich failed")
    } finally {
      setEnriching(false)
    }
  }

  const emailVerified = !!lead?.email && lead.tags?.some((t) => t.startsWith("enriched:"))

  return (
    <div className="min-h-screen bg-[#07080F] text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading lead…
          </div>
        )}

        {!loading && error && (
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="p-10 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h2 className="text-lg font-semibold text-rose-300">Lead not found</h2>
              <p className="text-sm text-slate-400">{error}</p>
              <Link href="/leads">
                <Button variant="outline" size="sm" className="mt-2">
                  Return to Leads
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && !error && lead && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white truncate">{lead.company}</h1>
                  <Badge variant="outline" className={cn("text-[11px]", statusConfig[lead.status]?.className)}>
                    {statusConfig[lead.status]?.label || lead.status}
                  </Badge>
                </div>
                <p className="text-slate-400 mt-1 truncate">{lead.title}</p>
                {lead.clientName && lead.clientName !== lead.company && (
                  <p className="text-sm text-slate-500">Client: {lead.clientName}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={enrich}
                  disabled={enriching}
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", enriching && "animate-spin")} />
                  {enriching ? "Enriching…" : "Enrich email"}
                </Button>
              </div>
            </div>

            {enrichMsg && (
              <p className="text-xs text-slate-500 mb-4">{enrichMsg}</p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-slate-800/60 bg-[#0d0d14]">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Contact & Opportunity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field icon={Mail} label="Email">
                      {lead.email ? (
                        <span className="inline-flex items-center gap-2">
                          {lead.email}
                          {emailVerified && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> verified
                            </Badge>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-500">No email — click Enrich</span>
                      )}
                    </Field>
                    <Field icon={Phone} label="Phone">{lead.phone || "—"}</Field>
                    <Field icon={MapPin} label="Country">{lead.country || "—"}</Field>
                    <Field icon={Globe} label="Platform / Source">{lead.platform || "—"}</Field>
                    <Field icon={Globe} label="Job URL">
                      {lead.url ? (
                        <a href={lead.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline break-all">
                          {lead.url}
                        </a>
                      ) : "—"}
                    </Field>
                    <Field icon={Calendar} label="Deadline">{lead.deadline || "—"}</Field>
                  </div>

                  {(lead.technologies?.length > 0 || lead.skills?.length > 0) && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Technologies & Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[...(lead.technologies || []), ...(lead.skills || [])].map((t, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-slate-500/10 text-slate-300 border-slate-700">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.description && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Description</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{lead.description}</p>
                    </div>
                  )}

                  {lead.notes && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{lead.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-slate-800/60 bg-[#0d0d14]">
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Value</h3>
                    <Field icon={DollarSign} label="Budget">
                      {lead.budget?.min || lead.budget?.max
                        ? `${fmtMoney(lead.budget.min)} – ${fmtMoney(lead.budget.max)}`
                        : "—"}
                    </Field>
                    <Field icon={TrendingUp} label="Expected Revenue">{fmtMoney(lead.expectedRevenue)}</Field>
                    <Field icon={DollarSign} label="Payment Method">{lead.paymentMethod || "—"}</Field>
                    <Field icon={Target} label="Project Size">{lead.projectSize || "—"}</Field>
                  </CardContent>
                </Card>

                <Card className="border-slate-800/60 bg-[#0d0d14]">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-white">Classification</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Urgency</span>
                      <Badge variant="outline" className={cn("text-[10px]", urgencyConfig[lead.urgency])}>
                        {lead.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Risk</span>
                      <Badge variant="outline" className={cn("text-[10px]", riskConfig[lead.riskLevel])}>
                        {lead.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Difficulty</span>
                      <span className="text-slate-200">{lead.difficulty ?? "—"}/100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Success Probability</span>
                      <span className="text-slate-200">{lead.successProbability ?? "—"}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Competition</span>
                      <span className="text-slate-200">{lead.competition ?? "—"}</span>
                    </div>
                  </CardContent>
                </Card>

                {lead.tags?.length > 0 && (
                  <Card className="border-slate-800/60 bg-[#0d0d14]">
                    <CardContent className="p-5">
                      <h3 className="text-sm font-semibold text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {lead.tags.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-slate-500/10 text-slate-300 border-slate-700">
                            <Tag className="w-2.5 h-2.5 mr-1" /> {t}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
