"use client"

import { useState, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CommandPalette } from "@/components/command-palette"
import { useFavorites } from "@/lib/favorites-context"
import { useTheme } from "@/lib/theme-context"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/topbar"
import { Footer } from "@/components/footer"

const pageLabels: Record<string, string> = {
  "/": "Dashboard",
  "/opportunity-hunter": "Opportunity Hunter",
  "/leads": "Leads",
  "/proposals": "Proposals",
  "/ai-search": "AI Search",
  "/connectors": "Connectors",
  "/knowledge": "Knowledge Base",
  "/notifications": "Notifications",
  "/crm": "CRM",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/calendar": "Calendar",
  "/team": "Team",
  "/favorites": "Favorites",
  "/settings": "Settings",
  "/admin": "Admin",
}

const AUTH_ROUTES = ["/login", "/register"]

export function AppShell({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { addRecentPage } = useFavorites()

  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  useEffect(() => {
    if (pathname && pageLabels[pathname]) {
      addRecentPage(pathname, pageLabels[pathname])
    }
  }, [pathname, addRecentPage])

  useEffect(() => {
    if (isAuthPage) return

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((p) => !p)
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setShowShortcuts((p) => !p)
      }
      if ((e.metaKey || e.ctrlKey) && e.key) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const pages = ["/", "/opportunity-hunter", "/leads", "/proposals", "/ai-search", "/connectors", "/knowledge", "/crm", "/reports"]
          if (pages[num - 1]) {
            e.preventDefault()
            router.push(pages[num - 1])
          }
        }
        if (e.key === "0") { e.preventDefault(); router.push("/analytics") }
        if (e.key === "a") { e.preventDefault(); router.push("/admin") }
        if (e.key === "t") { e.preventDefault(); router.push("/team") }
        if (e.key === "l") { e.preventDefault(); router.push("/calendar") }
        if (e.key === "b") { e.preventDefault(); document.dispatchEvent(new CustomEvent("mbpw:toggle-sidebar")) }
        if (e.key === "e") { e.preventDefault(); document.dispatchEvent(new CustomEvent("mbpw:export")) }
        if (e.key === "/") { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus() }
      }
      if (e.key === "Escape") {
        setCommandOpen(false)
        setShowShortcuts(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [router, isAuthPage])

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onMenuToggle={() => document.dispatchEvent(new CustomEvent("mbpw:toggle-sidebar"))} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {showShortcuts && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2">
              {[
                { keys: "⌘K", desc: "Command palette" },
                { keys: "⌘1-9", desc: "Navigate to pages" },
                { keys: "⌘0", desc: "Go to Analytics" },
                { keys: "⌘A", desc: "Admin Panel" },
                { keys: "⌘T", desc: "Team page" },
                { keys: "⌘L", desc: "Calendar" },
                { keys: "⌘B", desc: "Toggle sidebar" },
                { keys: "⌘E", desc: "Export dashboard" },
                { keys: "⌘/", desc: "Focus search bar" },
                { keys: "?", desc: "Toggle this menu" },
                { keys: "ESC", desc: "Close modals / menus" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-zinc-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
