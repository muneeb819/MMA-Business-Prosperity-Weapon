"use client"

import { Activity, Shield, Clock, GitBranch } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500/80">All Systems Online</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Shield className="w-3 h-3 text-zinc-600" />
              <span>Enterprise Security</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-600" />
              <span>v0.9.0</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-600">
            <span>&copy; {new Date().getFullYear()} MMA Business Prosperity Weapon</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Built with Next.js & FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
