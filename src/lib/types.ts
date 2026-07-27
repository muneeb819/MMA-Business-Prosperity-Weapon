export type LeadStatus = 'new' | 'analyzing' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'archived'
export type AgentStatus = 'idle' | 'scanning' | 'analyzing' | 'generating' | 'paused' | 'error'
export type JobType = 'remote' | 'hybrid' | 'onsite' | 'contract' | 'freelance' | 'full_time' | 'part_time'
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'

export interface Lead {
  id: string
  title: string
  description: string
  clientName: string
  company: string
  email: string
  phone: string
  country: string
  budget: { min: number; max: number }
  deadline: string
  technologies: string[]
  skills: string[]
  platform: string
  jobType: JobType
  status: LeadStatus
  urgency: UrgencyLevel
  difficulty: number
  successProbability: number
  riskLevel: RiskLevel
  expectedRevenue: number
  competition: number
  projectSize: 'small' | 'medium' | 'large' | 'enterprise'
  paymentMethod: string
  clientHistory: string
  url: string
  foundAt: string
  analyzedAt?: string
  proposalId?: string
  notes: string
  tags: string[]
}

export interface Proposal {
  id: string
  leadId: string
  title: string
  coverLetter: string
  introduction: string
  technicalPlan: string
  timeline: string
  costEstimate: string
  portfolioSuggestions: string[]
  callToAction: string
  winProbability: number
  status: 'draft' | 'review' | 'submitted' | 'accepted' | 'rejected'
  createdAt: string
  submittedAt?: string
}

export interface Agent {
  id: string
  name: string
  type: 'opportunity_hunter' | 'lead_analyzer' | 'proposal_generator'
  status: AgentStatus
  lastActive: string
  tasksCompleted: number
  currentTask?: string
  uptime: number
  efficiency: number
  description: string
  icon: string
}

export interface Notification {
  id: string
  type: 'high_value' | 'urgent' | 'government' | 'enterprise' | 'follow_up' | 'system' | 'agent'
  title: string
  message: string
  leadId?: string
  read: boolean
  createdAt: string
  priority: 'low' | 'medium' | 'high'
}

export interface CRMCompany {
  id: string
  name: string
  industry: string
  country: string
  website: string
  contacts: CRMContact[]
  leads: string[]
  revenue: number
  status: 'prospect' | 'active' | 'inactive' | 'partner'
  notes: string
  createdAt: string
}

export interface CRMContact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  companyId: string
}

export interface ActivityLog {
  id: string
  agentId: string
  action: string
  details: string
  timestamp: string
  status: 'success' | 'error' | 'info'
}

export interface AnalyticsData {
  totalLeads: number
  totalProposals: number
  winRate: number
  totalRevenue: number
  avgDealSize: number
  conversionRate: number
  topCountries: { country: string; count: number; revenue: number }[]
  topTechnologies: { tech: string; count: number }[]
  monthlyRevenue: { month: string; revenue: number; proposals: number }[]
  platformBreakdown: { platform: string; leads: number }[]
  agentPerformance: { agent: string; efficiency: number; tasks: number }[]
  industryTrends: { industry: string; growth: number; opportunities: number }[]
}

export interface SearchQuery {
  id: string
  query: string
  filters: {
    country?: string
    budgetMin?: number
    budgetMax?: number
    technologies?: string[]
    jobType?: JobType
    platform?: string
  }
  resultCount: number
  createdAt: string
  status: 'running' | 'completed' | 'error'
}

export interface Connector {
  id: string
  name: string
  type: 'scraper' | 'api' | 'rss' | 'webhook'
  platform?: string
  status: 'active' | 'inactive' | 'syncing' | 'error'
  config: Record<string, any>
  lastSyncAt?: string
  syncCount: number
  leadsFound: number
  errorMessage?: string
  createdAt: string
  updatedAt?: string
}
