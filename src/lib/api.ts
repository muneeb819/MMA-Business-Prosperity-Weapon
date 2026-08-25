import type { Lead, Proposal, CRMCompany, Notification, AnalyticsData, Connector } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  let token: string | null = null;
  try { token = JSON.parse(localStorage.getItem("mbpw_auth") || "null")?.token; } catch {}
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders, ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  leads: {
    list: (params?: Record<string, string>) =>
      fetchAPI<Lead[]>(`/api/leads?${new URLSearchParams(params || {})}`),
    get: (id: string) => fetchAPI<Lead>(`/api/leads/${id}`),
    create: (data: Partial<Lead>) =>
      fetchAPI<Lead>("/api/leads", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Lead>) =>
      fetchAPI<Lead>(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI(`/api/leads/${id}`, { method: "DELETE" }),
    archive: (id: string) =>
      fetchAPI(`/api/leads/${id}/archive`, { method: "PUT" }),
    stats: () => fetchAPI("/api/leads/stats/summary"),
  },
  proposals: {
    list: (params?: Record<string, string>) =>
      fetchAPI<Proposal[]>(`/api/proposals?${new URLSearchParams(params || {})}`),
    get: (id: string) => fetchAPI<Proposal>(`/api/proposals/${id}`),
    create: (data: Partial<Proposal>) =>
      fetchAPI<Proposal>("/api/proposals", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Proposal>) =>
      fetchAPI<Proposal>(`/api/proposals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI(`/api/proposals/${id}`, { method: "DELETE" }),
    submit: (id: string) =>
      fetchAPI(`/api/proposals/${id}/submit`, { method: "POST" }),
    duplicate: (id: string) =>
      fetchAPI(`/api/proposals/${id}/duplicate`, { method: "POST" }),
    generate: (data: { leadId?: string; tone: string; instructions?: string; leadData?: any }) =>
      fetchAPI("/api/proposals/generate", { method: "POST", body: JSON.stringify(data) }),
    sendEmail: (id: string, data: { recipient_email: string; subject?: string; message?: string }) =>
      fetchAPI(`/api/proposals/${id}/send-email`, { method: "POST", body: JSON.stringify(data) }),
    sendDirect: (data: { recipient_email: string; subject: string; body_text: string; body_html?: string }) =>
      fetchAPI("/api/proposals/send-direct", { method: "POST", body: JSON.stringify(data) }),
  },
  crm: {
    companies: {
      list: (params?: Record<string, string>) =>
        fetchAPI<CRMCompany[]>(`/api/crm/companies?${new URLSearchParams(params || {})}`),
      get: (id: string) => fetchAPI<CRMCompany>(`/api/crm/companies/${id}`),
      create: (data: Partial<CRMCompany>) =>
        fetchAPI<CRMCompany>("/api/crm/companies", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: Partial<CRMCompany>) =>
        fetchAPI<CRMCompany>(`/api/crm/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchAPI(`/api/crm/companies/${id}`, { method: "DELETE" }),
    },
    contacts: {
      list: (params?: Record<string, string>) =>
        fetchAPI(`/api/crm/contacts?${new URLSearchParams(params || {})}`),
      create: (data: any) =>
        fetchAPI("/api/crm/contacts", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: any) =>
        fetchAPI(`/api/crm/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchAPI(`/api/crm/contacts/${id}`, { method: "DELETE" }),
    },
  },
  notifications: {
    list: (filter?: string) =>
      fetchAPI<Notification[]>(`/api/notifications?filter=${filter || "all"}`),
    markRead: (id: string) =>
      fetchAPI(`/api/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () =>
      fetchAPI("/api/notifications/read-all", { method: "PUT" }),
    dismiss: (id: string) =>
      fetchAPI(`/api/notifications/${id}`, { method: "DELETE" }),
    clearAll: () =>
      fetchAPI("/api/notifications", { method: "DELETE" }),
    unreadCount: () =>
      fetchAPI<{ count: number }>("/api/notifications/unread-count"),
  },
  analytics: {
    get: (period?: string) =>
      fetchAPI<AnalyticsData>(`/api/analytics?period=${period || "30d"}`),
  },
  search: {
    search: (data: any) =>
      fetchAPI("/api/search/natural-language", { method: "POST", body: JSON.stringify(data) }),
    sources: () => fetchAPI("/api/search/sources"),
    toggleSource: (name: string) =>
      fetchAPI(`/api/search/sources/${name}/toggle`, { method: "POST" }),
  },
  ai: {
    status: () => fetchAPI("/api/ai/status"),
    insights: () => fetchAPI("/api/ai/insights"),
    interpret: (query: string) =>
      fetchAPI("/api/ai/interpret", { method: "POST", body: JSON.stringify({ query }) }),
    analyzeLead: (leadId: string) =>
      fetchAPI(`/api/leads/${leadId}/analyze`, { method: "POST" }),
    briefing: () => fetchAPI("/api/ai/briefing"),
    checkQuality: (data: any) =>
      fetchAPI("/api/ai/check-quality", { method: "POST", body: JSON.stringify(data) }),
    leadDecision: (leadId: string) => fetchAPI(`/api/ai/leads/${leadId}/decision`),
  },
  agents: {
    list: () => fetchAPI("/api/agents"),
    start: (id: string) =>
      fetchAPI(`/api/agents/${id}/start`, { method: "POST" }),
    run: (id: string) =>
      fetchAPI(`/api/agents/${id}/run`, { method: "POST" }),
    pause: (id: string) =>
      fetchAPI(`/api/agents/${id}/pause`, { method: "POST" }),
    activity: (id: string) =>
      fetchAPI(`/api/agents/${id}/activity`),
  },
  connectors: {
    list: () => fetchAPI<Connector[]>("/api/connectors"),
    create: (data: { name: string; type: string; platform?: string; config?: Record<string, any> }) =>
      fetchAPI<Connector>("/api/connectors", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Connector>) =>
      fetchAPI<Connector>(`/api/connectors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    sync: (id: string) =>
      fetchAPI(`/api/connectors/${id}/sync`, { method: "POST" }),
    delete: (id: string) =>
      fetchAPI(`/api/connectors/${id}`, { method: "DELETE" }),
  },
  knowledge: {
    list: (params?: Record<string, string>) =>
      fetchAPI(`/api/knowledge?${new URLSearchParams(params || {})}`),
    get: (id: string) => fetchAPI(`/api/knowledge/${id}`),
    create: (data: { title: string; entryType: string; content: string; tags?: string[]; source?: string; sourceUrl?: string }) =>
      fetchAPI("/api/knowledge", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      fetchAPI(`/api/knowledge/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/api/knowledge/${id}`, { method: "DELETE" }),
    types: () => fetchAPI<string[]>("/api/knowledge/types/list"),
  },
  reports: {
    pipeline: (days?: number) => fetchAPI(`/api/reports/pipeline?days=${days || 30}`),
    performance: (days?: number) => fetchAPI(`/api/reports/performance?days=${days || 30}`),
    summary: () => fetchAPI("/api/reports/summary"),
  },
  leadSources: {
    list: () => fetchAPI(`/api/lead-sources`),
    sync: (name: string, limit?: number) =>
      fetchAPI(`/api/lead-sources/sync/${name}?limit=${limit || 50}`, { method: "POST" }),
    syncAll: (limit?: number) =>
      fetchAPI(`/api/lead-sources/sync-all?limit=${limit || 30}`, { method: "POST" }),
  },
  outreach: {
    cadence: () => fetchAPI<any>(`/api/outreach/cadence`),
    leads: () => fetchAPI<any[]>(`/api/outreach/leads`),
    preview: (data: { lead_id: string; step?: number; custom_note?: string }) =>
      fetchAPI<any>(`/api/outreach/preview`, { method: "POST", body: JSON.stringify(data) }),
    send: (data: { lead_id: string; step?: number; custom_note?: string }) =>
      fetchAPI<any>(`/api/outreach/send`, { method: "POST", body: JSON.stringify(data) }),
    records: () => fetchAPI<any[]>(`/api/outreach/records`),
    reply: (id: string) =>
      fetchAPI<any>(`/api/outreach/${id}/reply`, { method: "POST" }),
    stats: () => fetchAPI<any>(`/api/outreach/stats`),
  },
  aiTeams: {
    list: () => fetchAPI<any>("/api/ai-teams"),
    get: (id: string) => fetchAPI<any>(`/api/ai-teams/${id}`),
    chat: (id: string, message: string) =>
      fetchAPI<any>(`/api/ai-teams/${id}/chat`, { method: "POST", body: JSON.stringify({ message }) }),
    toggle: (id: string) =>
      fetchAPI<any>(`/api/ai-teams/${id}/toggle`, { method: "POST" }),
    dailyReport: () => fetchAPI<any>("/api/ai-teams/reports/daily"),
    activity: (limit?: number) =>
      fetchAPI<any>(`/api/ai-teams/activity?limit=${limit || 50}`),
    supervisor: {
      health: () => fetchAPI<any>("/api/ai-teams/supervisor/health"),
      scan: () => fetchAPI<any>("/api/ai-teams/supervisor/scan"),
      issues: () => fetchAPI<any>("/api/ai-teams/supervisor/issues"),
      chat: (message: string) =>
        fetchAPI<any>("/api/ai-teams/supervisor/chat", { method: "POST", body: JSON.stringify({ message }) }),
      reconcile: () => fetchAPI<any>("/api/ai-teams/supervisor/actions/reconcile", { method: "POST" }),
      securityAudit: () => fetchAPI<any>("/api/ai-teams/supervisor/actions/security-audit", { method: "POST" }),
      performanceCheck: () => fetchAPI<any>("/api/ai-teams/supervisor/actions/performance-check", { method: "POST" }),
      redistribute: () => fetchAPI<any>("/api/ai-teams/supervisor/actions/redistribute", { method: "POST" }),
      report: () => fetchAPI<any>("/api/ai-teams/supervisor/report"),
    },
  },
};
