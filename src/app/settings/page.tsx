"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme, THEMES, type ThemeId } from "@/lib/theme-context"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Sun, Moon, Shield, Bell, User, Database, Globe, Palette, Users, Key, Save, CheckCircle, LogOut, Trash2, Check } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme, themeDef } = useTheme()
  const { user, logout } = useAuth()
  const [saved, setSaved] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [name, setName] = useState(user?.name || "Admin")
  const [email, setEmail] = useState(user?.email || "admin@mbpw.com")
  const [prov, setProv] = useState<{ hunter_api_key?: { set: boolean; masked: string }; apollo_api_key?: { set: boolean; masked: string } }>({})
  const [hunterKey, setHunterKey] = useState("")
  const [apolloKey, setApolloKey] = useState("")
  const [provLoading, setProvLoading] = useState(false)
  const [provSaved, setProvSaved] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    api.settings.get().then((d) => setProv(d || {})).catch(() => {})
  }, [])

  const saveProvider = async () => {
    setProvLoading(true)
    try {
      await api.settings.update({
        hunter_api_key: hunterKey || undefined,
        apollo_api_key: apolloKey || undefined,
      })
      setProvSaved(true)
      setTimeout(() => setProvSaved(false), 2000)
      const d = await api.settings.get()
      setProv(d || {})
      setHunterKey("")
      setApolloKey("")
    } catch {}
    setProvLoading(false)
  }

  const testProvider = async () => {
    setTestLoading(true)
    setTestResult(null)
    try {
      const d = await api.settings.test({
        hunter_api_key: hunterKey || undefined,
        apollo_api_key: apolloKey || undefined,
      })
      setTestResult(d)
    } catch (e: any) {
      setTestResult({ error: e?.message || "Test failed" })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <Breadcrumbs />
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your preferences and account</p>
            </div>

            {/* Theme Selector */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Appearance</h2>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <p className="text-xs text-muted-foreground">Choose a theme for the application interface.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === t.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <span
                        className="w-10 h-10 rounded-full border-2 shadow-md"
                        style={{ backgroundColor: t.accent, borderColor: t.accent }}
                      />
                      <span className="text-xs font-medium">{t.label}</span>
                      {t.dark ? (
                        <Moon className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Sun className="w-3 h-3 text-muted-foreground" />
                      )}
                      {theme === t.id && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile</h2>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 via-rose-600 to-rose-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {name.split(" ").map((s) => s[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">Role: {user?.role || "admin"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-muted/30 border-border h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-muted/30 border-border h-10 rounded-xl"
                    />
                  </div>
                </div>
                <Button onClick={handleSave} size="sm" className="bg-gradient-to-r from-primary to-rose-600 hover:from-primary/90 hover:to-rose-500 text-white shadow-lg shadow-primary/20">
                  {saved ? <><CheckCircle className="w-4 h-4 mr-2 text-emerald-300" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notifications</h2>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                {[
                  { title: "High-value opportunities", desc: "Get notified of opportunities >$50k" },
                  { title: "Urgent deadlines", desc: "Reminders for approaching deadlines" },
                  { title: "AI recommendations", desc: "Daily AI-generated recommendations" },
                  { title: "System alerts", desc: "Agent status and system updates" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-primary transition-colors cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Email Provider */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "125ms" }}>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Verified Email Provider</h2>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Connect a provider to enrich leads with <span className="text-foreground font-medium">real, verified decision-maker emails</span> (instead of guessed role inboxes). Apollo finds a person; Hunter finds a company address.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Hunter API Key {prov.hunter_api_key?.set ? <span className="text-emerald-400 ml-1">● Active (…{prov.hunter_api_key.masked})</span> : <span className="text-zinc-500 ml-1">— not set</span>}
                    </label>
                    <Input type="password" value={hunterKey} onChange={(e) => setHunterKey(e.target.value)} placeholder={prov.hunter_api_key?.set ? "Enter new key to replace" : "HUNTER_API_KEY"} className="bg-muted/30 border-border h-10 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Apollo API Key {prov.apollo_api_key?.set ? <span className="text-emerald-400 ml-1">● Active (…{prov.apollo_api_key.masked})</span> : <span className="text-zinc-500 ml-1">— not set</span>}
                    </label>
                    <Input type="password" value={apolloKey} onChange={(e) => setApolloKey(e.target.value)} placeholder={prov.apollo_api_key?.set ? "Enter new key to replace" : "APOLLO_API_KEY"} className="bg-muted/30 border-border h-10 rounded-xl" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={saveProvider} size="sm" disabled={provLoading} className="bg-gradient-to-r from-primary to-rose-600 hover:from-primary/90 hover:to-rose-500 text-white shadow-lg shadow-primary/20">
                    {provSaved ? <><CheckCircle className="w-4 h-4 mr-2 text-emerald-300" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> {provLoading ? "Saving…" : "Save Provider Keys"}</>}
                  </Button>
                  <Button onClick={testProvider} size="sm" variant="outline" disabled={testLoading} className="border-border hover:bg-muted/50">
                    {testLoading ? "Testing…" : "Test connection"}
                  </Button>
                  <span className="text-xs text-muted-foreground">Keys are stored server-side and never shown in full.</span>
                </div>
                {testResult && !testResult.error && (
                  <div className="text-xs space-y-1">
                    <p className={testResult.apollo?.ok ? "text-emerald-400" : "text-zinc-400"}>
                      Apollo: {testResult.apollo?.ok ? `verified (${testResult.apollo.email})` : (testResult.apollo?.error || "not verified")}
                    </p>
                    <p className={testResult.hunter?.ok ? "text-emerald-400" : "text-zinc-400"}>
                      Hunter: {testResult.hunter?.ok ? `verified (${testResult.hunter.email})` : (testResult.hunter?.error || "not verified")}
                    </p>
                  </div>
                )}
                {testResult?.error && <p className="text-xs text-red-400">{testResult.error}</p>}
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h2>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Change Password</p>
                      <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted/50">Update</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Active Sessions</p>
                      <p className="text-xs text-muted-foreground">1 active session</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted/50">Manage</Button>
                </div>
              </div>
            </div>

            {/* Data */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
              <h2 className="text-sm font-semibold flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Data</h2>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Export All Data</p>
                    <p className="text-xs text-muted-foreground">Download your data as CSV</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted/50">Export</Button>
                </div>
                {showDanger ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
                    <p className="text-xs text-red-400 font-medium">This will permanently delete all data. This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs" onClick={() => setShowDanger(false)}>Confirm Delete</Button>
                      <Button size="sm" variant="outline" className="border-border hover:bg-muted/50 text-xs" onClick={() => setShowDanger(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-400">Danger Zone</p>
                      <p className="text-xs text-muted-foreground">Delete all data</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-red-500/30 hover:bg-red-500/10 text-red-400" onClick={() => setShowDanger(true)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete All Data
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">MBPW v0.9.0</p>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs">
                <LogOut className="w-3 h-3 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
