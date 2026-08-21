"use client"

import { ExternalLink, Mail, Globe, Building2 } from "lucide-react"

export interface Source {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  status: string
  leadsFound: number
  lastScan: string
  description: string
  gradient: string
  metrics: { accuracy: number; speed: number }
}

export interface Discovery {
  id: string
  title: string
  company: string
  location: string
  industry: string
  dealSize: number
  score: number
  source: string
  discoveredAt: string
  tags: string[]
  status: string
  contact: string
  website: string
  description: string
}

export interface SearchCategory {
  id: string
  label: string
  selected: boolean
}

export interface FilterOption {
  id: string
  label: string
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const STORAGE_DISCOVERIES_KEY = "mbpw_hunter_discoveries"
const STORAGE_SOURCES_KEY = "mbpw_hunter_sources"

export function getStoredDiscoveries(): Discovery[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_DISCOVERIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function storeDiscoveries(d: Discovery[]) {
  localStorage.setItem(STORAGE_DISCOVERIES_KEY, JSON.stringify(d))
}

export function getStoredSourceStats(): Record<string, { leadsFound: number; lastScan: string }> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_SOURCES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function storeSourceStats(s: Record<string, { leadsFound: number; lastScan: string }>) {
  localStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify(s))
}

export function liveLeadToDiscovery(ll: any): Discovery {
  const salary = (ll.salaryMax || ll.salaryMin || 0)
  const budget = salary > 0 ? salary * 12 : Math.floor(Math.random() * 80000 + 20000)
  const techs = ll.technologies || ll.tags || []
  return {
    id: ll.id,
    title: ll.title || "Untitled Position",
    company: ll.company || "Unknown Company",
    location: ll.location || ll.country || "Remote",
    industry: techs.length > 0 ? techs.slice(0, 3).join(", ") : "Technology",
    dealSize: budget,
    score: Math.floor(Math.random() * 30 + 70),
    source: ll.source || ll.platform || "Unknown",
    discoveredAt: ll.publishedAt || new Date().toISOString(),
    tags: techs.slice(0, 5),
    status: "new",
    contact: `contact@${(ll.company || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    website: ll.url || "",
    description: (ll.description || "").slice(0, 300),
  }
}

export const initialCategories: SearchCategory[] = [
  { id: "saas", label: "SaaS Companies", selected: true },
  { id: "startups", label: "Startups (Seed-A)", selected: true },
  { id: "enterprise", label: "Enterprise", selected: false },
  { id: "ecommerce", label: "E-commerce", selected: true },
  { id: "healthcare", label: "Healthcare", selected: false },
  { id: "finance", label: "FinTech", selected: true },
  { id: "manufacturing", label: "Manufacturing", selected: false },
  { id: "education", label: "EdTech", selected: false },
  { id: "agency", label: "Agencies", selected: true },
  { id: "remote", label: "Remote-first", selected: false },
]

export const statusColors: Record<string, string> = {
  "new": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "contacted": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "qualified": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "proposal-sent": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "negotiation": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

export const platformFilters: FilterOption[] = [
  { id: "all", label: "All Platforms" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter/X" },
  { id: "web", label: "Web" },
  { id: "email", label: "Email" },
  { id: "crunchbase", label: "Crunchbase" },
  { id: "github", label: "GitHub" },
]

export const countryFilters: FilterOption[] = [
  { id: "all", label: "All Countries" },
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "de", label: "Germany" },
  { id: "au", label: "Australia" },
]

export const technologyFilters: FilterOption[] = [
  { id: "all", label: "All Tech" },
  { id: "react", label: "React" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "aws", label: "AWS" },
  { id: "ai", label: "AI/ML" },
]
