import { Lead, Proposal, Agent, Notification, CRMCompany, ActivityLog, AnalyticsData } from './types'

export const mockAgents: Agent[] = []
export const mockLeads: Lead[] = []
export const mockProposals: Proposal[] = []
export const mockNotifications: Notification[] = []
export const mockCompanies: CRMCompany[] = []
export const mockActivityLog: ActivityLog[] = []
export const mockAnalytics: AnalyticsData = {
  totalLeads: 0,
  totalProposals: 0,
  winRate: 0,
  totalRevenue: 0,
  avgDealSize: 0,
  conversionRate: 0,
  topCountries: [],
  topTechnologies: [],
  monthlyRevenue: [],
  platformBreakdown: [],
  agentPerformance: [],
  industryTrends: [],
}
