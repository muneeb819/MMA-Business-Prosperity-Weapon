"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/page-transition"
import { GlassCard, GlassCardContent } from "@/components/glass-card"
import { Mail, ShieldCheck, UserRound, Users } from "lucide-react"

const API_BASE = "" // same-origin relative /api routes

interface TeamUser {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at?: string
}

const roleColors: Record<string, string> = {
  superadmin: "from-rose-500 to-orange-500",
  admin: "from-indigo-500 to-violet-500",
  manager: "from-emerald-500 to-teal-500",
  user: "from-sky-500 to-indigo-500",
}

function initialsFromEmail(email: string) {
  const base = email.split("@")[0] || email
  const parts = base.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

function displayNameFromEmail(email: string) {
  const base = email.split("@")[0] || email
  return base
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ") || email
}

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Team | MBPW"
    const token = localStorage.getItem("mbpw_token")
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resolves the one-time localStorage auth check.
      setError("Sign in to view the team directory.")
      setLoading(false)
      return
    }
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null)
        if (!r.ok) {
          throw new Error(data?.detail || (r.status === 403 ? "Admin access required to view the team directory." : "Request failed"))
        }
        return data
      })
      .then((data) => {
        const list: TeamUser[] = Array.isArray(data) ? data : data?.users || []
        setUsers(list)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Couldn't load team members.")
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <PageTransition>
            <div className="space-y-6">
              <Breadcrumbs />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-400 bg-clip-text text-transparent">
                  Team
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {loading ? "Loading team members…" : error ? "Team directory" : `${users.length} registered ${users.length === 1 ? "member" : "members"}`}
                </p>
              </div>

              {loading && (
                <GlassCard>
                  <GlassCardContent className="py-10 text-center text-sm text-muted-foreground">
                    Loading team members…
                  </GlassCardContent>
                </GlassCard>
              )}

              {!loading && error && (
                <GlassCard>
                  <GlassCardContent className="py-10 text-center space-y-2">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </GlassCardContent>
                </GlassCard>
              )}

              {!loading && !error && users.length === 0 && (
                <GlassCard>
                  <GlassCardContent className="py-10 text-center space-y-2">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">No team members registered yet.</p>
                  </GlassCardContent>
                </GlassCard>
              )}

              {!loading && !error && users.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((member, i) => (
                    <StaggerItem key={member.id || i}>
                      <GlassCard glow="blue" className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleColors[member.role] || "from-zinc-500 to-zinc-600"} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {initialsFromEmail(member.email)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">{displayNameFromEmail(member.email)}</h3>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 capitalize">
                                <ShieldCheck className="w-3 h-3" /> {member.role}
                              </span>
                              <span className={`flex items-center gap-1 ${member.is_active ? "text-emerald-400" : "text-amber-400"}`}>
                                <UserRound className="w-3 h-3" /> {member.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-all"
                          >
                            <Mail className="w-3 h-3" /> Email
                          </a>
                          {member.created_at && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              Joined {new Date(member.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </GlassCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
