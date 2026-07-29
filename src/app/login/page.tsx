"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Eye, EyeOff, Loader2, Sparkles, Bot, Globe, FileText, Users, BarChart3, Target, Search, Bell, BookOpen, Cable } from "lucide-react"

const features = [
  { icon: Bot, label: "AI Agents", color: "from-blue-500 to-cyan-400" },
  { icon: Globe, label: "Opportunity Hunter", color: "from-cyan-500 to-teal-400" },
  { icon: Target, label: "Lead Scoring", color: "from-emerald-500 to-teal-400" },
  { icon: FileText, label: "Proposal Studio", color: "from-violet-500 to-purple-400" },
  { icon: Search, label: "AI Search", color: "from-amber-500 to-orange-400" },
  { icon: Bell, label: "Smart Alerts", color: "from-rose-500 to-pink-400" },
  { icon: Users, label: "CRM", color: "from-indigo-500 to-blue-400" },
  { icon: BarChart3, label: "Analytics", color: "from-purple-500 to-violet-400" },
  { icon: BookOpen, label: "Knowledge", color: "from-emerald-500 to-teal-400" },
  { icon: Cable, label: "Connectors", color: "from-teal-500 to-cyan-400" },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("admin@mbpw.com")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, name, password)
      } else {
        await login(email, password)
      }
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white font-bold text-2xl mb-4 shadow-2xl shadow-blue-500/30">
              MBPW
            </div>
            <h1 className="text-2xl font-bold">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-zinc-400 mt-1">
              {isRegister ? "Set up your MBPW workspace" : "MMA Business Prosperity Weapon"}
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="bg-zinc-800/50 border-zinc-700/50 h-11 rounded-xl focus-visible:ring-cyan-500/30" />
              </div>
              {isRegister && (
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Full Name</label>
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="bg-zinc-800/50 border-zinc-700/50 h-11 rounded-xl focus-visible:ring-cyan-500/30" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">Password</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required className="bg-zinc-800/50 border-zinc-700/50 h-11 rounded-xl pr-10 focus-visible:ring-cyan-500/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => { setIsRegister(!isRegister); setError("") }} className="text-sm text-zinc-400 hover:text-cyan-400 transition-colors">
                {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-96 bg-zinc-900/50 border-l border-zinc-800/50 p-8 flex-col">
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-gradient">AI-Powered Platform</h2>
          <p className="text-sm text-zinc-400 mt-1">Everything you need to win business</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/30 hover:bg-zinc-800/50 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center shrink-0`}>
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-300">{f.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 text-center">
          <p className="text-xs text-zinc-400">Powered by Advanced AI</p>
          <p className="text-[10px] text-zinc-500 mt-1">Discover · Analyze · Win</p>
        </div>
      </div>
    </div>
  )
}
