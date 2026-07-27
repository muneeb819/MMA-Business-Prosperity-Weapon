import type { Lead, Proposal, CRMCompany, Notification, AnalyticsData, Connector } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
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
    generate: (data: { leadId: string; tone: string; instructions?: string }) =>
      fetchAPI("/api/proposals/generate", { method: "POST", body: JSON.stringify(data) }),
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
  },
  agents: {
    list: () => fetchAPI("/api/agents"),
    start: (id: string) =>
      fetchAPI(`/api/agents/${id}/start`, { method: "POST" }),
    pause: (id: string) =>
      fetchAPI(`/api/agents/${id}/pause`, { method: "POST" }),
    activity: (id: string) =>
      fetchAPI(`/api/agents/${id}/activity`),
  },
  dashboard: {
    get: () => fetchAPI("/api/dashboard"),
    insights: () => fetchAPI("/api/dashboard/insights"),
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
  seed: () => fetchAPI("/api/seed", { method: "POST" }),
};
