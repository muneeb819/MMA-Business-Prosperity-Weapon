const API_SOURCES = {
  himalayas: {
    name: "Himalayas",
    icon: "🏔️",
    fetch: async (limit = 20) => {
      const res = await fetch(`https://himalayas.app/jobs/api?limit=${Math.min(limit, 20)}`);
      const data = await res.json();
      return (data.jobs || []).map((j: any) => ({
        id: `live-himalayas-${j.id}`,
        title: j.title || "",
        company: j.companyName || "",
        description: (j.description || "").slice(0, 1500),
        url: j.url || "",
        location: j.location || "",
        country: j.country || "",
        salaryMin: j.salary?.min || 0,
        salaryMax: j.salary?.max || 0,
        technologies: (j.technologies || []).map((t: any) => t.name || t),
        remote: j.remote || false,
        platform: "himalayas",
        source: "Himalayas",
        publishedAt: j.publishedAt || "",
        tags: j.tags || [],
      }));
    },
  },
  remoteok: {
    name: "RemoteOK",
    icon: "🌍",
    fetch: async (limit = 20) => {
      const res = await fetch("https://remoteok.com/api", {
        headers: { "User-Agent": "MBPW-Lead-Generator/1.0" },
      });
      const data = await res.json();
      return data
        .filter((j: any) => j && j.id && j.position)
        .slice(0, limit)
        .map((j: any) => ({
          id: `live-remoteok-${j.id}`,
          title: j.position || "",
          company: j.company || "",
          description: (j.description || "").slice(0, 1500),
          url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
          location: j.location || "",
          salaryMin: j.salary_min || 0,
          salaryMax: j.salary_max || 0,
          technologies: j.tags || [],
          remote: true,
          platform: "remoteok",
          source: "RemoteOK",
          publishedAt: j.date || "",
          tags: j.tags || [],
        }));
    },
  },
  remotive: {
    name: "Remotive",
    icon: "🏠",
    fetch: async (limit = 20) => {
      const res = await fetch("https://remotive.com/remote-jobs/feed");
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      const items = doc.querySelectorAll("item");
      const jobs: any[] = [];
      items.forEach((item) => {
        if (jobs.length >= limit) return;
        const title = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "";
        const desc = item.querySelector("description")?.textContent || "";
        const category = item.querySelector("category")?.textContent || "";
        let company = "";
        let cleanTitle = title;
        if (title.includes("—")) {
          const parts = title.split("—");
          company = parts[0].trim();
          cleanTitle = parts[1].trim();
        }
        jobs.push({
          id: `live-remotive-${btoa(link).slice(0, 12)}`,
          title: cleanTitle,
          company,
          description: desc.replace(/<[^>]+>/g, "").slice(0, 1500),
          url: link,
          location: "Remote",
          technologies: category ? [category] : [],
          remote: true,
          platform: "remotive",
          source: "Remotive",
          publishedAt: "",
          tags: category ? [category] : [],
        });
      });
      return jobs;
    },
  },
  weworkremotely: {
    name: "We Work Remotely",
    icon: "🌐",
    fetch: async (limit = 20) => {
      const res = await fetch("https://weworkremotely.com/remote-jobs.rss");
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      const items = doc.querySelectorAll("item");
      const jobs: any[] = [];
      items.forEach((item) => {
        if (jobs.length >= limit) return;
        const title = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "";
        const desc = item.querySelector("description")?.textContent || "";
        let company = "";
        let cleanTitle = title;
        if (title.includes(" at ")) {
          const idx = title.lastIndexOf(" at ");
          if (idx > 0) {
            cleanTitle = title.slice(0, idx).trim();
            company = title.slice(idx + 4).trim();
          }
        }
        const cleanDesc = desc.replace(/<[^>]+>/g, "").slice(0, 1500);
        const techs: string[] = [];
        const lower = cleanDesc.toLowerCase();
        for (const t of ["python", "javascript", "typescript", "react", "node", "go", "rust", "java", "ruby"]) {
          if (lower.includes(t)) techs.push(t);
        }
        jobs.push({
          id: `live-wwr-${btoa(link).slice(0, 12)}`,
          title: cleanTitle,
          company,
          description: cleanDesc,
          url: link,
          location: "Remote",
          technologies: techs,
          remote: true,
          platform: "weworkremotely",
          source: "We Work Remotely",
          publishedAt: "",
          tags: techs,
        });
      });
      return jobs;
    },
  },
  arbeitnow: {
    name: "Arbeitnow",
    icon: "💼",
    fetch: async (limit = 20) => {
      const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
      const data = await res.json();
      return (data.data || []).slice(0, limit).map((j: any) => ({
        id: `live-arbeitnow-${j.id}`,
        title: j.title || "",
        company: j.company_name || "",
        description: (j.description || "").replace(/<[^>]+>/g, "").slice(0, 1500),
        url: j.url || "",
        location: j.location || "",
        technologies: j.tags || [],
        remote: j.remote || false,
        platform: "arbeitnow",
        source: "Arbeitnow",
        publishedAt: j.created_at || "",
        tags: j.tags || [],
      }));
    },
  },
  findwork: {
    name: "Findwork",
    icon: "🔍",
    fetch: async (limit = 20) => {
      const res = await fetch("https://findwork.dev/api/jobs/?order_by=date_posted");
      const data = await res.json();
      return (data.results || []).slice(0, limit).map((j: any) => ({
        id: `live-findwork-${j.id}`,
        title: j.text || "",
        company: j.company_name || "",
        description: (j.text || "").slice(0, 1500),
        url: j.url || "",
        location: j.location || "",
        technologies: j.technology_roles || [],
        remote: j.remote || false,
        platform: "findwork",
        source: "Findwork",
        publishedAt: j.date_posted || "",
        tags: j.technology_roles || [],
      }));
    },
  },
};

export interface LiveLead {
  id: string;
  title: string;
  company: string;
  description: string;
  url: string;
  location: string;
  country?: string;
  salaryMin?: number;
  salaryMax?: number;
  technologies: string[];
  remote: boolean;
  platform: string;
  source: string;
  publishedAt: string;
  tags: string[];
}

const STORAGE_KEY = "mbpw_live_leads";
const STORAGE_TS_KEY = "mbpw_live_leads_ts";

export function getStoredLeads(): LiveLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function storeLeads(leads: LiveLead[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  localStorage.setItem(STORAGE_TS_KEY, new Date().toISOString());
}

export function getLastSyncTime(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_TS_KEY);
}

export async function fetchFromSource(sourceName: string, limit = 20): Promise<LiveLead[]> {
  const source = API_SOURCES[sourceName as keyof typeof API_SOURCES];
  if (!source) throw new Error(`Unknown source: ${sourceName}`);
  return source.fetch(limit);
}

export async function fetchAllSources(limit = 15): Promise<{
  leads: LiveLead[];
  results: Record<string, { fetched: number; error?: string }>;
}> {
  const allLeads: LiveLead[] = [];
  const results: Record<string, { fetched: number; error?: string }> = {};

  const sourceNames = Object.keys(API_SOURCES);
  const promises = sourceNames.map(async (name) => {
    try {
      const leads = await fetchFromSource(name, limit);
      allLeads.push(...leads);
      results[name] = { fetched: leads.length };
    } catch (e: any) {
      results[name] = { fetched: 0, error: e.message || "Failed" };
    }
  });

  await Promise.allSettled(promises);

  const existing = getStoredLeads();
  const existingIds = new Set(existing.map((l) => l.id));
  const newLeads = allLeads.filter((l) => !existingIds.has(l.id));
  const merged = [...existing, ...newLeads];
  storeLeads(merged);

  return { leads: merged, results };
}

export function clearStoredLeads() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_TS_KEY);
}

export const SOURCE_LIST = Object.entries(API_SOURCES).map(([key, val]) => ({
  name: key,
  display_name: val.name,
  icon: val.icon,
}));
