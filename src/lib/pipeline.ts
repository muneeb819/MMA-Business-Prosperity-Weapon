import type { Lead } from "./types";
import type { LiveLead } from "./live-sources";

export function liveLeadToLead(ll: LiveLead): Lead {
  return {
    id: ll.id,
    title: ll.title,
    description: ll.description,
    clientName: ll.company,
    company: ll.company,
    email: "",
    phone: "",
    country: ll.country || "",
    budget: { min: ll.salaryMin || 0, max: ll.salaryMax || 0 },
    deadline: "",
    technologies: ll.technologies,
    skills: [],
    platform: ll.platform,
    jobType: "full_time",
    status: "new" as const,
    urgency: "medium" as const,
    difficulty: 50,
    successProbability: 60,
    riskLevel: "medium",
    expectedRevenue: (ll.salaryMax || 20000) * 0.3,
    competition: 0,
    projectSize: "medium",
    paymentMethod: "Escrow",
    clientHistory: `Sourced from ${ll.source}`,
    url: ll.url,
    notes: `Live lead from ${ll.source}`,
    tags: ll.tags,
    foundAt: ll.publishedAt || new Date().toISOString(),
    analyzedAt: undefined,
  };
}

const PROPOSALS_KEY = "mbpw_proposals";

export function getStoredProposals(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROPOSALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function storeProposals(proposals: any[]) {
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
}

export function addProposal(proposal: any) {
  const existing = getStoredProposals();
  existing.unshift(proposal);
  storeProposals(existing);
}

const NOTIF_KEY = "mbpw_notifications";

export function getStoredNotifications(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function storeNotifications(notifs: any[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function addNotification(notif: any) {
  const existing = getStoredNotifications();
  existing.unshift(notif);
  if (existing.length > 100) existing.length = 100;
  storeNotifications(existing);
}
