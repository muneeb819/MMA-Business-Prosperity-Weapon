"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Target,
  Search,
  DollarSign,
  Clock,
  X,
  Globe,
  Mail,
  ExternalLink,
  Building2,
} from "lucide-react"
import { formatCurrency, timeAgo, cn } from "@/lib/utils"
import { PulseDot } from "./AgentFleet"
import type { Lead } from "@/lib/types"

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

interface LeadPipelineProps {
  leads: Lead[]
  selectedLeadId: string | null
  sortBy: "probability" | "revenue" | "date"
  filterSource: string | null
  searchQuery: string
  onSortChange: (sort: "probability" | "revenue" | "date") => void
  onFilterSourceChange: (source: string | null) => void
  onSearchChange: (query: string) => void
  onLeadSelect: (leadId: string | null) => void
  onSourceClick: (sourceName: string) => void
}

const searchSources = [
  { name: "LinkedIn", icon: ExternalLink, count: 45 },
  { name: "Twitter", icon: ExternalLink, count: 23 },
  { name: "Email", icon: Mail, count: 12 },
  { name: "Web", icon: Globe, count: 67 },
  { name: "Crunchbase", icon: Building2, count: 31 },
  { name: "GitHub", icon: CodeIcon, count: 18 },
]

const LeadPipeline = React.memo(function LeadPipeline({
  leads,
  selectedLeadId,
  sortBy,
  filterSource,
  searchQuery,
  onSortChange,
  onFilterSourceChange,
  onSearchChange,
  onLeadSelect,
  onSourceClick,
}: LeadPipelineProps) {
  const sortedLeads = [...leads]
    .sort((a, b) => {
      if (sortBy === "probability")
        return b.successProbability - a.successProbability
      if (sortBy === "revenue") return b.expectedRevenue - a.expectedRevenue
      return new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
    })
    .filter((lead) => {
      if (filterSource) {
        return lead.platform
          .toLowerCase()
          .includes(filterSource.toLowerCase())
      }
      return true
    })
    .filter((lead) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          lead.clientName.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.title.toLowerCase().includes(q)
        )
      }
      return true
    })
    .slice(0, 5)

  const selectedLead = selectedLeadId
    ? leads.find((l) => l.id === selectedLeadId)
    : null
  const hotCount = leads.filter((l) => l.successProbability >= 80).length

  return (
    <div className="space-y-6">
      <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20 shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg">Priority Leads</CardTitle>
                <CardDescription>Top scoring opportunities</CardDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-rose-500/10 text-rose-400 border-rose-500/20 shrink-0"
            >
              {hotCount} hot
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-zinc-800/50 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs h-7 px-2",
                  sortBy === "probability"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400"
                )}
                onClick={() => onSortChange("probability")}
                title="Sort by probability"
              >
                <Target className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs h-7 px-2",
                  sortBy === "revenue"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400"
                )}
                onClick={() => onSortChange("revenue")}
                title="Sort by revenue"
              >
                <DollarSign className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-xs h-7 px-2",
                  sortBy === "date"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400"
                )}
                onClick={() => onSortChange("date")}
                title="Sort by date"
              >
                <Clock className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="space-y-3">
            {sortedLeads.map((lead) => (
              <div
                key={lead.id}
                className={cn(
                  "p-3 rounded-xl bg-zinc-800/30 border transition-all cursor-pointer group",
                  selectedLeadId === lead.id
                    ? "border-cyan-500/50 bg-zinc-800/50"
                    : "border-zinc-800/50 hover:border-zinc-700/50"
                )}
                onClick={() =>
                  onLeadSelect(
                    selectedLeadId === lead.id ? null : lead.id
                  )
                }
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm group-hover:text-white transition-colors truncate">
                      {lead.clientName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {lead.company} &bull; {lead.title}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs shrink-0 ml-2",
                      lead.successProbability >= 90
                        ? "bg-emerald-500/10 text-emerald-400"
                        : lead.successProbability >= 70
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-zinc-500/10 text-zinc-400"
                    )}
                  >
                    {lead.successProbability}%
                  </Badge>
                </div>
                <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
                      lead.successProbability >= 90
                        ? "bg-gradient-to-r from-emerald-500 to-green-400"
                        : lead.successProbability >= 70
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                          : "bg-gradient-to-r from-zinc-500 to-zinc-400"
                    )}
                    style={{ width: `${lead.successProbability}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatCurrency(lead.expectedRevenue)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(new Date(lead.foundAt))}
                  </span>
                </div>
              </div>
            ))}
            {sortedLeads.length === 0 && (
              <p className="text-center text-sm text-zinc-500 py-4">
                No leads match your search.
              </p>
            )}
          </div>
          {selectedLead && (
            <div className="mt-3 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {selectedLead.clientName}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedLead.company} &bull; {selectedLead.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white shrink-0 h-7"
                  onClick={() => onLeadSelect(null)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {selectedLead.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <DollarSign className="w-3 h-3" />
                  <span>
                    {formatCurrency(selectedLead.budget.min)} &ndash;{" "}
                    {formatCurrency(selectedLead.budget.max)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Globe className="w-3 h-3" />
                  <span>{selectedLead.platform}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    Due{" "}
                    {new Date(selectedLead.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedLead.technologies.slice(0, 5).map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="text-[10px] bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg">Search Sources</CardTitle>
                <CardDescription>
                  Active monitoring channels
                </CardDescription>
              </div>
            </div>
            {filterSource && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white shrink-0"
                onClick={() => onFilterSourceChange(null)}
              >
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {searchSources.map((source) => {
              const Icon = source.icon
              return (
                <div
                  key={source.name}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full border transition-all cursor-pointer group",
                    filterSource === source.name
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-zinc-800/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                  )}
                  onClick={() => {
                    onFilterSourceChange(
                      filterSource === source.name ? null : source.name
                    )
                    onSourceClick(source.name)
                  }}
                >
                  <PulseDot status="active" className="!h-2 !w-2" />
                  <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                    {source.name}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {source.count}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { LeadPipeline }
