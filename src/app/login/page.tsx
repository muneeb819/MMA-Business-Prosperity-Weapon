"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Bot,
  Globe,
  FileText,
  Users,
  BarChart3,
  Target,
  Search,
  Bell,
  BookOpen,
  Cable,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react"

const features = [
  { icon: Bot, label: "AI Agents", desc: "3 autonomous agents hunting opportunities 24/7", color: "from-blue-500 to-cyan-400" },
  { icon: Globe, label: "Opportunity Hunter", desc: "Scan global platforms for the best contracts", color: "from-cyan-500 to-teal-400" },
  { icon: Target, label: "Lead Scoring", desc: "AI-ranked leads with revenue projections", color: "from-emerald-500 to-teal-400" },
  { icon: FileText, label: "Proposal Studio", desc: "Generate winning proposals in seconds", color: "from-violet-500 to-purple-400" },
  { icon: Search, label: "AI Search", desc: "Natural language search across all data", color: "from-amber-500 to-orange-400" },
  { icon: Bell, label: "Smart Alerts", desc: "Never miss a high-value opportunity", color: "from-rose-500 to-pink-400" },
  { icon: Users, label: "CRM", desc: "Manage companies, contacts & relationships", color: "from-indigo-500 to-blue-400" },
  { icon: BarChart3, label: "Analytics", desc: "Revenue, pipeline & performance insights", color: "from-purple-500 to-violet-400" },
  { icon: BookOpen, label: "Knowledge Base", desc: "Playbooks, retrospectives & best practices", color: "from-emerald-500 to-teal-400" },
  { icon: Cable, label: "Connectors", desc: "Upwork, LinkedIn, Indeed & more", color: "from-teal-500 to-cyan-400" },
]

const stats = [
  { value: "0", label: "Leads Tracked" },
  { value: "0%", label: "AI Efficiency" },
  { value: "$0", label: "Revenue Pipeline" },
  { value: "24/7", label: "Agent Uptime" },
]

const testimonials = [
  { text: "MBPW is an AI-powered business development platform.", author: "MMA Team", role: "MBPW" },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [testiIndex, setTestiIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestiIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      setError(err.message || "Authentication failed. Please try again.")
    }
    setLoading(false)
  }, [email, name, password, isRegister, login, register, router])

  const fillDemo = useCallback(() => {
    setEmail("admin@mbpw.com")
    setPassword("admin123")
    setIsRegister(false)
    setError("")
  }, [])

  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#07080F] flex overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"
        />

        {/* Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Scan Line */}
        <motion.div
          animate={{ y: ["-100%", "100vh"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
        />
      </div>

      {/* LEFT SIDE — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 40 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.8 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 relative">
                <span className="text-white font-black text-xl tracking-tight">MBPW</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-zinc-500 mt-2 text-sm">
              {isRegister
                ? "Start closing more deals with AI-powered business development"
                : "Sign in to access your AI-powered sales command center"}
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/40 relative overflow-hidden"
          >
            {/* Card Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full h-12 px-4 bg-zinc-800/40 border border-zinc-700/50 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all duration-200 group-hover:border-zinc-600/60"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>

              {/* Name Field (Register only) */}
              <AnimatePresence>
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full h-12 px-4 bg-zinc-800/40 border border-zinc-700/50 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full h-12 px-4 pr-12 bg-zinc-800/40 border border-zinc-700/50 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all duration-200 group-hover:border-zinc-600/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-700/30"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me / Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-800/50 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center">
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                      <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isRegister ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-zinc-900/50 text-xs text-zinc-600">or</span>
              </div>
            </div>

            {/* Social Logins (placeholder) */}
            <div className="grid grid-cols-2 gap-3">
              <button className="h-11 rounded-xl border border-zinc-800/60 bg-zinc-800/20 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-300 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="h-11 rounded-xl border border-zinc-800/60 bg-zinc-800/20 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-300 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegister(!isRegister); setError("") }}
                className="text-sm text-zinc-500 hover:text-blue-400 transition-colors duration-200"
              >
                {isRegister ? (
                  <>Already have an account? <span className="font-medium text-blue-400">Sign in</span></>
                ) : (
                  <>Don&apos;t have an account? <span className="font-medium text-blue-400">Register</span></>
                )}
              </button>
            </div>
          </motion.div>

          {/* Demo Credentials Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.6 }}
            className="mt-5 text-center"
          >
            <button
              onClick={fillDemo}
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 hover:border-blue-500/20 hover:bg-zinc-900/50 transition-all duration-300"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                Quick fill demo credentials
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE — Feature Showcase */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 60 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-[420px] xl:w-[480px] bg-zinc-900/30 border-l border-zinc-800/40 flex-col relative overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/3 via-transparent to-purple-500/3 pointer-events-none" />

        <div className="relative flex flex-col h-full p-8 xl:p-10">
          {/* Header */}
          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold text-gradient"
            >
              AI-Powered Business Development
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-zinc-500 mt-1"
            >
              Everything you need to discover, analyze, and win business
            </motion.p>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-800/20 border border-zinc-800/30">
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Feature Carousel */}
          <div className="flex-1 flex flex-col">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Platform Features</div>
            <div className="flex-1 space-y-2">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                  onClick={() => setActiveFeature(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer group ${
                    activeFeature === i
                      ? "bg-zinc-800/40 border-zinc-700/50 shadow-lg shadow-black/20"
                      : "bg-transparent border-transparent hover:bg-zinc-800/20 hover:border-zinc-800/30"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center shrink-0 transition-all duration-300 ${
                    activeFeature === i ? "shadow-md scale-105" : "opacity-60 group-hover:opacity-80"
                  }`}>
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium transition-colors ${
                      activeFeature === i ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                    }`}>
                      {f.label}
                    </div>
                    <div className={`text-[11px] leading-relaxed transition-colors truncate ${
                      activeFeature === i ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      {f.desc}
                    </div>
                  </div>
                  {activeFeature === i && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10"
          >
            <Quote className="w-4 h-4 text-blue-500/40 mb-2" />
            <AnimatePresence mode="wait">
              <motion.div
                key={testiIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;{testimonials[testiIndex].text}&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {testimonials[testiIndex].author[0]}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-300">{testimonials[testiIndex].author}</div>
                    <div className="text-[10px] text-zinc-600">{testimonials[testiIndex].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestiIndex(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === testiIndex ? "w-4 bg-blue-500" : "w-1 bg-zinc-700 hover:bg-zinc-600"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-zinc-800/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-600">All systems operational</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-zinc-700" />
              <span className="text-[10px] text-zinc-600">Secured with JWT</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
