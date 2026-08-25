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
  contactEmail: string
  contactPhone: string
  contactWhatsApp: string
  contactFacebook: string
  contactLinkedIn: string
  contactTwitter: string
  contactInstagram: string
  contactAllMethods: string[]
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
  const budget = salary
  const techs = ll.technologies || ll.tags || []
  const company = ll.company || "Unknown Company"
  const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, "")

  // Extract email from description if present
  const desc = ll.description || ""
  const emailMatch = desc.match(/[\w.-]+@[\w.-]+\.\w{2,}/g)
  const contactEmail = emailMatch ? emailMatch[0] : `contact@${companySlug}.com`

  // Extract phone if present
  const phoneMatch = desc.match(/[\+]?[(]?\d{1,4}[)]?[-\s./]?\d{1,4}[-\s./]?\d{1,9}/)
  const contactPhone = phoneMatch ? phoneMatch[0] : ""

  // Social media from description
  const linkedInMatch = desc.match(/linkedin\.com\/company\/[\w-]+/i)
  const twitterMatch = desc.match(/(?:twitter|x)\.com\/@?([\w]+)/i)
  const fbMatch = desc.match(/facebook\.com\/[\w.]+/i)
  const igMatch = desc.match(/instagram\.com\/[\w.]+/i)
  const igHandle = /\binstagram\b/i.test(desc) ? desc.match(/@([a-zA-Z0-9_.]+)/) : null

  const website = ll.url || ""

  // Build contact methods
  const contactAllMethods: string[] = []
  contactAllMethods.push(`Email: ${contactEmail}`)
  if (website) contactAllMethods.push(`Website: ${website}`)
  if (contactPhone) contactAllMethods.push(`Phone: ${contactPhone}`)
  if (linkedInMatch) contactAllMethods.push(`LinkedIn: https://${linkedInMatch[0]}`)
  else contactAllMethods.push(`LinkedIn: https://linkedin.com/company/${companySlug}`)
  if (twitterMatch) contactAllMethods.push(`Twitter: https://x.com/${twitterMatch[1]}`)
  if (fbMatch) contactAllMethods.push(`Facebook: https://${fbMatch[0]}`)
  else contactAllMethods.push(`Facebook: https://facebook.com/${companySlug}`)
  if (igMatch) contactAllMethods.push(`Instagram: https://${igMatch[0]}`)
  else if (igHandle) contactAllMethods.push(`Instagram: https://instagram.com/${igHandle[1]}`)
  else contactAllMethods.push(`Instagram: https://instagram.com/${companySlug}`)
  contactAllMethods.push(`WhatsApp: https://wa.me/${contactPhone ? contactPhone.replace(/[^0-9]/g, "") : ""}`)

  return {
    id: ll.id,
    title: ll.title || "Untitled Position",
    company: ll.company || "Unknown Company",
    location: ll.location || ll.country || "Remote",
    industry: detectIndustry(ll.title || "", techs, desc),
    dealSize: budget,
    score: Math.floor(Math.random() * 30 + 70),
    source: ll.source || ll.platform || "Unknown",
    discoveredAt: ll.publishedAt || new Date().toISOString(),
    tags: techs.slice(0, 5),
    status: "new",
    contact: contactEmail,
    website,
    description: desc.slice(0, 500),
    contactEmail,
    contactPhone,
    contactWhatsApp: `https://wa.me/${contactPhone ? contactPhone.replace(/[^0-9]/g, "") : ""}`,
    contactFacebook: `https://facebook.com/${companySlug}`,
    contactLinkedIn: linkedInMatch ? `https://${linkedInMatch[0]}` : `https://linkedin.com/company/${companySlug}`,
    contactTwitter: twitterMatch ? `https://x.com/${twitterMatch[1]}` : "",
    contactInstagram: igMatch
      ? `https://${igMatch[0]}`
      : igHandle
        ? `https://instagram.com/${igHandle[1]}`
        : `https://instagram.com/${companySlug}`,
    contactAllMethods,
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
  { id: "information_technology", label: "Information Technology", selected: true },
  { id: "graphic_design", label: "Graphic Design", selected: true },
  { id: "telemarketing", label: "Telemarketing", selected: true },
  { id: "bpo", label: "BPO Industry", selected: true },
]

const INDUSTRY_KEYWORD_MAP: Record<string, string[]> = {
  information_technology: [
    "software", "developer", "engineer", "devops", "cloud", "saas", "platform",
    "api", "data", "machine learning", "ai", "artificial intelligence", "cybersecurity",
    "network", "infrastructure", "database", "frontend", "backend", "full stack",
    "react", "python", "java", "typescript", "node", "aws", "azure", "gcp",
    "blockchain", "iot", "mobile", "ios", "android", "ux", "ui", "qa", "testing",
    "scrum", "agile", "scrum master", "product owner", "tech lead", "cto",
    "sysadmin", "linux", "windows server", "kubernetes", "docker", "terraform",
    "information technology", "it support", "help desk", "technical support",
    "systems administrator", "network engineer", "security analyst",
  ],
  graphic_design: [
    "graphic design", "visual design", "ui design", "ux design", "branding",
    "illustration", "photoshop", "figma", "sketch", "adobe", "canva",
    "logo", "typography", "layout", "print design", "packaging",
    "motion graphics", "animation", "video editing", "after effects",
    "premiere", "indesign", "illustrator", "creative director", "art director",
    "web design", "interface design", "icon design", "infographic",
    "3d design", "blender", "cinema 4d", "Maya", "photo retouching",
    "color theory", "composition", "visual identity", "design system",
    "design thinking", "wireframe", "prototype", "mockup",
  ],
  telemarketing: [
    "telemarketing", "telesales", "cold calling", "call center", "outbound",
    "inbound", "sales rep", "sales agent", "appointment setting", "lead generation",
    "b2b sales", "b2c sales", "cold outreach", "sales funnel", "conversion",
    "crm", "salesforce", "hubspot", "dialer", "auto dialer", "predictive dialer",
    "sales manager", "sales director", "business development", "account executive",
    "inside sales", "outside sales", "sdr", "bdr", "closer", "presales",
    "upselling", "cross-selling", "customer acquisition", "retention",
    "commission", "quota", "pipeline", "prospecting", "follow up",
  ],
  bpo: [
    "bpo", "business process outsourcing", "outsourcing", "offshore",
    "nearshore", "outsourced", "virtual assistant", "va", "back office",
    "front office", "data entry", "data processing", "document processing",
    "customer service", "technical support", "it helpdesk", "help desk",
    "call center management", "quality assurance", "workforce management",
    "process improvement", "lean", "six sigma", "automation", "rpa",
    "robotic process automation", "shared services", "center of excellence",
    "knowledge process outsourcing", "kpo", "lpo", "legal process outsourcing",
    "finance accounting outsourcing", "fao", "hr outsourcing", "payroll outsourcing",
    "vendor management", "sla", "service level agreement", "kpis",
  ],
}

export function detectIndustry(title: string, tags: string[], description: string): string {
  const text = `${title} ${(tags || []).join(" ")} ${description}`.toLowerCase()
  const scores: Record<string, number> = {}
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORD_MAP)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) score++
    }
    if (score > 0) scores[industry] = score
  }
  if (Object.keys(scores).length === 0) return "Information Technology"
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

export const industryFilters: FilterOption[] = [
  { id: "all", label: "All Industries" },
  { id: "information_technology", label: "Information Technology" },
  { id: "graphic_design", label: "Graphic Design" },
  { id: "telemarketing", label: "Telemarketing" },
  { id: "bpo", label: "BPO Industry" },
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
