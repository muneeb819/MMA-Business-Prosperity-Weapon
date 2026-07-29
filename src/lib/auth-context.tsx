"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  avatar_url: string
  last_login: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  sessionExpiresAt: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000

async function fetchAuth(url: string, options?: RequestInit): Promise<any> {
  const token = localStorage.getItem("mbpw_token")
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem("mbpw_token")
    if (savedToken) {
      setToken(savedToken)
      fetchAuth(`${API_BASE}/api/auth/me`)
        .then((userData) => { setUser(userData); setLoading(false) })
        .catch(() => { localStorage.removeItem("mbpw_token"); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!token || !user) return
    const expiresAt = Date.now() + SESSION_TIMEOUT_MS
    setSessionExpiresAt(expiresAt)
    const interval = setInterval(() => {
      if (Date.now() > expiresAt) {
        logout()
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [token, user])

  const login = useCallback(async (email: string, password: string) => {
    const data = await fetchAuth(`${API_BASE}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem("mbpw_token", data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (email: string, name: string, password: string) => {
    const data = await fetchAuth(`${API_BASE}/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    })
    localStorage.setItem("mbpw_token", data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }, [])

  const logout = useCallback(async () => {
    try { await fetchAuth(`${API_BASE}/api/auth/logout`, { method: "POST" }) } catch {}
    localStorage.removeItem("mbpw_token")
    setToken(null)
    setUser(null)
    setSessionExpiresAt(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user, sessionExpiresAt }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) return { user: null, token: null, loading: true, login: async () => {}, register: async () => {}, logout: async () => {}, isAuthenticated: false, sessionExpiresAt: null }
  return ctx
}
