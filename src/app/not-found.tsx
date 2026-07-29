export const dynamic = 'force-dynamic'

import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-500 to-zinc-600 text-white">
            <span className="text-3xl font-bold">404</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-zinc-400 text-sm">The page you are looking for does not exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all">
            <Home className="w-4 h-4 mr-2" /> Go Home
          </Link>
          <Link href="/ai-search" className="inline-flex items-center px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800/50 text-zinc-300 text-sm font-medium transition-all">
            <Search className="w-4 h-4 mr-2" /> Search
          </Link>
        </div>
      </div>
    </div>
  )
}
