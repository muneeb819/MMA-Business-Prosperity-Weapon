"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/lib/theme-context"
import { useAuth } from "@/lib/auth-context"
import { Sun, Moon, Shield, Bell, User, Database, Globe, Palette, Users, Key, Save, CheckCircle, LogOut, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [saved, setSaved] = useState(false)
  const [showDanger, setShowDanger] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <Breadcrumbs />
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-zinc-400 mt-1">Manage your preferences and account</p>
            </div>

            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Palette className="w-4 h-4 text-cyan-400" /> Appearance</h2>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      {theme === "dark" ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Theme</p>
                      <p className="text-xs text-zinc-500">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
                    </div>
                  </div>
                  <Button onClick={toggleTheme} variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50">
                    {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><User className="w-4 h-4 text-cyan-400" /> Profile</h2>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1 block">Name</label>
                    <Input defaultValue={user?.name || "Admin"} className="bg-zinc-800/50 border-zinc-700/50 h-10 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1 block">Email</label>
                    <Input defaultValue={user?.email || "admin@mbpw.com"} className="bg-zinc-800/50 border-zinc-700/50 h-10 rounded-xl" />
                  </div>
                </div>
                <Button onClick={handleSave} size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20">
                  {saved ? <><CheckCircle className="w-4 h-4 mr-2 text-emerald-300" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Bell className="w-4 h-4 text-cyan-400" /> Notifications</h2>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
                {[
                  { title: "High-value opportunities", desc: "Get notified of opportunities >$50k" },
                  { title: "Urgent deadlines", desc: "Reminders for approaching deadlines" },
                  { title: "AI recommendations", desc: "Daily AI-generated recommendations" },
                  { title: "System alerts", desc: "Agent status and system updates" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                    <div className="relative">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 rounded-full bg-zinc-700 peer-checked:bg-cyan-600 transition-colors cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400" /> Security</h2>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="text-sm">Change Password</p>
                      <p className="text-xs text-zinc-500">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50">Update</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="text-sm">Active Sessions</p>
                      <p className="text-xs text-zinc-500">1 active session</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50">Manage</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
              <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Database className="w-4 h-4 text-cyan-400" /> Data</h2>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Export All Data</p>
                    <p className="text-xs text-zinc-500">Download your data as CSV</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-800 hover:bg-zinc-800/50">Export</Button>
                </div>
                {showDanger ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
                    <p className="text-xs text-red-400 font-medium">This will permanently delete all data. This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs" onClick={() => setShowDanger(false)}>Confirm Delete</Button>
                      <Button size="sm" variant="outline" className="border-zinc-800 hover:bg-zinc-800/50 text-xs" onClick={() => setShowDanger(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-400">Danger Zone</p>
                      <p className="text-xs text-zinc-500">Delete all data</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-red-500/30 hover:bg-red-500/10 text-red-400" onClick={() => setShowDanger(true)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete All Data
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-zinc-800/50">
              <p className="text-xs text-zinc-500">MBPW v0.9.0</p>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs">
                <LogOut className="w-3 h-3 mr-1" /> Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
