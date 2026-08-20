"use client"

import { ExternalLink, Mail, Globe, Building2 } from "lucide-react"

function Code(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

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

export const searchSources: Source[] = []

export const discoveries: Discovery[] = []

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
