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

export const searchSources: Source[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: ExternalLink,
    status: "active",
    leadsFound: 45,
    lastScan: "2 min ago",
    description: "Professional network scraping and engagement tracking",
    gradient: "from-blue-500 to-blue-700",
    metrics: { accuracy: 94, speed: 88 },
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: ExternalLink,
    status: "active",
    leadsFound: 23,
    lastScan: "5 min ago",
    description: "Real-time social listening and sentiment analysis",
    gradient: "from-sky-500 to-cyan-600",
    metrics: { accuracy: 87, speed: 95 },
  },
  {
    id: "email",
    name: "Email Mining",
    icon: Mail,
    status: "active",
    leadsFound: 12,
    lastScan: "12 min ago",
    description: "Automated email pattern recognition and lead extraction",
    gradient: "from-emerald-500 to-teal-600",
    metrics: { accuracy: 91, speed: 72 },
  },
  {
    id: "web",
    name: "Web Crawling",
    icon: Globe,
    status: "active",
    leadsFound: 67,
    lastScan: "1 min ago",
    description: "Deep web scraping with intelligent content filtering",
    gradient: "from-violet-500 to-purple-600",
    metrics: { accuracy: 89, speed: 92 },
  },
  {
    id: "crunchbase",
    name: "Crunchbase",
    icon: Building2,
    status: "idle",
    leadsFound: 31,
    lastScan: "1 hour ago",
    description: "Startup and company data enrichment",
    gradient: "from-amber-500 to-orange-600",
    metrics: { accuracy: 96, speed: 65 },
  },
  {
    id: "github",
    name: "GitHub",
    icon: Code,
    status: "active",
    leadsFound: 18,
    lastScan: "8 min ago",
    description: "Open source contributor activity monitoring",
    gradient: "from-zinc-400 to-zinc-600",
    metrics: { accuracy: 82, speed: 90 },
  },
]

export const discoveries: Discovery[] = [
  {
    id: "disc-1",
    title: "Series A SaaS Startup",
    company: "CloudSync Technologies",
    location: "San Francisco, CA",
    industry: "SaaS / Cloud",
    dealSize: 125000,
    score: 94,
    source: "LinkedIn",
    discoveredAt: "2 hours ago",
    tags: ["hot-lead", "decision-maker", "budget-confirmed"],
    status: "new",
    contact: "john@cloudsync.io",
    website: "https://cloudsync.io",
    description: "Series A funded SaaS startup looking for cloud infrastructure optimization. Decision maker identified with confirmed budget.",
  },
  {
    id: "disc-2",
    title: "Enterprise Digital Transformation",
    company: "Meridian Healthcare",
    location: "New York, NY",
    industry: "Healthcare",
    dealSize: 450000,
    score: 88,
    source: "Web Crawling",
    discoveredAt: "5 hours ago",
    tags: ["enterprise", "long-cycle", "multi-stakeholder"],
    status: "contacted",
    contact: "cto@meridianhealth.com",
    website: "https://meridianhealth.com",
    description: "Large healthcare provider undergoing digital transformation. Multi-stakeholder procurement process with 6-8 month cycle.",
  },
  {
    id: "disc-3",
    title: "AI Implementation Project",
    company: "Vertex Robotics",
    location: "Austin, TX",
    industry: "Manufacturing",
    dealSize: 275000,
    score: 91,
    source: "Twitter/X",
    discoveredAt: "8 hours ago",
    tags: ["ai-project", "technical-buyer", "urgency-high"],
    status: "qualified",
    contact: "vp-eng@vertexrobotics.com",
    website: "https://vertexrobotics.com",
    description: "Manufacturing company seeking AI implementation for quality control. Technical buyer identified with high urgency timeline.",
  },
  {
    id: "disc-4",
    title: "Marketing Automation Overhaul",
    company: "Bloom Digital Agency",
    location: "London, UK",
    industry: "Marketing",
    dealSize: 85000,
    score: 76,
    source: "Email Mining",
    discoveredAt: "1 day ago",
    tags: ["mid-market", "quick-close", "budget-flexible"],
    status: "proposal-sent",
    contact: "hello@bloomdigital.co.uk",
    website: "https://bloomdigital.co.uk",
    description: "Digital agency looking to overhaul their marketing automation stack. Quick close potential with flexible budget.",
  },
  {
    id: "disc-5",
    title: "Data Infrastructure Upgrade",
    company: "Pinnacle Financial",
    location: "Chicago, IL",
    industry: "Finance",
    dealSize: 320000,
    score: 82,
    source: "Crunchbase",
    discoveredAt: "1 day ago",
    tags: ["compliance", "security-focus", "enterprise"],
    status: "negotiation",
    contact: "infra@pinnaclefin.com",
    website: "https://pinnaclefin.com",
    description: "Financial institution upgrading data infrastructure with strict compliance and security requirements.",
  },
  {
    id: "disc-6",
    title: "E-commerce Platform Migration",
    company: "Nova Retail Group",
    location: "Toronto, Canada",
    industry: "Retail",
    dealSize: 195000,
    score: 79,
    source: "LinkedIn",
    discoveredAt: "2 days ago",
    tags: ["migration", "ecommerce", "growth-stage"],
    status: "new",
    contact: "tech@novaretail.ca",
    website: "https://novaretail.ca",
    description: "Fast-growing retail company migrating to a new e-commerce platform. Growth-stage company with scaling needs.",
  },
]

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
