"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { EmptyState } from "@/components/empty-state"
import { useFavorites } from "@/lib/favorites-context"
import { useRouter } from "next/navigation"
import { Star, Clock, X, ExternalLink, LayoutDashboard, Globe, Target, FileText, Search, Bell, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const iconMap: Record<string, any> = {
  LayoutDashboard, Globe, Target, FileText, Search, Bell, Users, BarChart3,
}

export default function FavoritesPage() {
  const router = useRouter()
  const { favorites, removeFavorite, recentPages } = useFavorites()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <Breadcrumbs />
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-400" />
                Favorites
              </h1>
              <p className="text-zinc-400 mt-1">Quick access to your most-used pages</p>
            </div>

            {favorites.length === 0 ? (
              <EmptyState
                type="default"
                title="No favorites yet"
                description="Star pages from the sidebar to add them here for quick access"
                action={{ label: "Go to Dashboard", href: "/" }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up">
                {favorites.map((f) => {
                  const Icon = iconMap[f.icon] || LayoutDashboard
                  return (
                    <button
                      key={f.href}
                      onClick={() => router.push(f.href)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-cyan-500/30 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.label}</p>
                        <p className="text-xs text-zinc-500 truncate">{f.href}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        <button onClick={(e) => { e.stopPropagation(); removeFavorite(f.href) }} className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {recentPages.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-zinc-500" /> Recent Pages
                </h2>
                <div className="space-y-1">
                  {recentPages.slice(0, 10).map((p) => {
                    const slug = p.href.replace("/", "") || "dashboard"
                    const Icon = iconMap[slug.charAt(0).toUpperCase() + slug.slice(1)] || LayoutDashboard
                    return (
                      <button
                        key={`${p.href}-${p.timestamp}`}
                        onClick={() => router.push(p.href)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-zinc-800/50 transition-all text-left group"
                      >
                        <Icon className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{p.label}</span>
                        <span className="ml-auto text-[10px] text-zinc-600">{new Date(p.timestamp).toLocaleDateString()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
