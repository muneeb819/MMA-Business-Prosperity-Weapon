"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type ThemeId =
  | "midnight"
  | "light"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "rose"
  | "slate"

export interface ThemeDef {
  id: ThemeId
  label: string
  accent: string
  dark: boolean
  vars: Record<string, string>
}

export const THEMES: ThemeDef[] = [
  {
    id: "midnight",
    label: "Midnight",
    accent: "#6366f1",
    dark: true,
    vars: {
      "--background": "250 30% 5%",
      "--foreground": "250 25% 96%",
      "--card": "250 30% 7%",
      "--card-foreground": "250 25% 96%",
      "--popover": "250 30% 8%",
      "--popover-foreground": "250 25% 96%",
      "--primary": "243 75% 59%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "250 25% 12%",
      "--secondary-foreground": "250 25% 96%",
      "--muted": "250 25% 12%",
      "--muted-foreground": "250 15% 65%",
      "--accent": "250 25% 12%",
      "--accent-foreground": "250 25% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "250 25% 96%",
      "--border": "250 20% 12%",
      "--input": "250 20% 12%",
      "--ring": "243 75% 59%",
    },
  },
  {
    id: "light",
    label: "Light",
    accent: "#2563eb",
    dark: false,
    vars: {
      "--background": "0 0% 98%",
      "--foreground": "222.2 84% 4.9%",
      "--card": "0 0% 100%",
      "--card-foreground": "222.2 84% 4.9%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222.2 84% 4.9%",
      "--primary": "221.2 83.2% 53.3%",
      "--primary-foreground": "210 40% 98%",
      "--secondary": "210 40% 96.1%",
      "--secondary-foreground": "222.2 47.4% 11.2%",
      "--muted": "210 40% 96.1%",
      "--muted-foreground": "215.4 16.3% 46.9%",
      "--accent": "210 40% 96.1%",
      "--accent-foreground": "222.2 47.4% 11.2%",
      "--destructive": "0 84.2% 60.2%",
      "--destructive-foreground": "210 40% 98%",
      "--border": "214.3 31.8% 91.4%",
      "--input": "214.3 31.8% 91.4%",
      "--ring": "221.2 83.2% 53.3%",
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    accent: "#06b6d4",
    dark: true,
    vars: {
      "--background": "210 30% 4%",
      "--foreground": "186 60% 95%",
      "--card": "210 30% 6%",
      "--card-foreground": "186 60% 95%",
      "--popover": "210 30% 7%",
      "--popover-foreground": "186 60% 95%",
      "--primary": "187 85% 53%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "210 25% 12%",
      "--secondary-foreground": "186 60% 95%",
      "--muted": "210 25% 12%",
      "--muted-foreground": "186 20% 55%",
      "--accent": "210 25% 12%",
      "--accent-foreground": "186 60% 95%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "186 60% 95%",
      "--border": "210 20% 10%",
      "--input": "210 20% 10%",
      "--ring": "187 85% 53%",
    },
  },
  {
    id: "forest",
    label: "Forest",
    accent: "#10b981",
    dark: true,
    vars: {
      "--background": "160 20% 4%",
      "--foreground": "150 30% 95%",
      "--card": "160 20% 6%",
      "--card-foreground": "150 30% 95%",
      "--popover": "160 20% 7%",
      "--popover-foreground": "150 30% 95%",
      "--primary": "160 85% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "160 15% 12%",
      "--secondary-foreground": "150 30% 95%",
      "--muted": "160 15% 12%",
      "--muted-foreground": "150 15% 55%",
      "--accent": "160 15% 12%",
      "--accent-foreground": "150 30% 95%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "150 30% 95%",
      "--border": "160 12% 10%",
      "--input": "160 12% 10%",
      "--ring": "160 85% 50%",
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    accent: "#f97316",
    dark: true,
    vars: {
      "--background": "20 20% 4%",
      "--foreground": "30 30% 95%",
      "--card": "20 20% 6%",
      "--card-foreground": "30 30% 95%",
      "--popover": "20 20% 7%",
      "--popover-foreground": "30 30% 95%",
      "--primary": "25 95% 53%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "20 15% 12%",
      "--secondary-foreground": "30 30% 95%",
      "--muted": "20 15% 12%",
      "--muted-foreground": "20 15% 55%",
      "--accent": "20 15% 12%",
      "--accent-foreground": "30 30% 95%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "30 30% 95%",
      "--border": "20 12% 10%",
      "--input": "20 12% 10%",
      "--ring": "25 95% 53%",
    },
  },
  {
    id: "lavender",
    label: "Lavender",
    accent: "#a78bfa",
    dark: true,
    vars: {
      "--background": "260 25% 4%",
      "--foreground": "250 30% 95%",
      "--card": "260 25% 6%",
      "--card-foreground": "250 30% 95%",
      "--popover": "260 25% 7%",
      "--popover-foreground": "250 30% 95%",
      "--primary": "258 90% 66%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "260 18% 12%",
      "--secondary-foreground": "250 30% 95%",
      "--muted": "260 18% 12%",
      "--muted-foreground": "260 12% 55%",
      "--accent": "260 18% 12%",
      "--accent-foreground": "250 30% 95%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "250 30% 95%",
      "--border": "260 14% 10%",
      "--input": "260 14% 10%",
      "--ring": "258 90% 66%",
    },
  },
  {
    id: "rose",
    label: "Rose",
    accent: "#f43f5e",
    dark: true,
    vars: {
      "--background": "350 25% 4%",
      "--foreground": "350 20% 95%",
      "--card": "350 25% 6%",
      "--card-foreground": "350 20% 95%",
      "--popover": "350 25% 7%",
      "--popover-foreground": "350 20% 95%",
      "--primary": "350 89% 60%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "350 15% 12%",
      "--secondary-foreground": "350 20% 95%",
      "--muted": "350 15% 12%",
      "--muted-foreground": "350 10% 55%",
      "--accent": "350 15% 12%",
      "--accent-foreground": "350 20% 95%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "350 20% 95%",
      "--border": "350 12% 10%",
      "--input": "350 12% 10%",
      "--ring": "350 89% 60%",
    },
  },
  {
    id: "slate",
    label: "Slate",
    accent: "#94a3b8",
    dark: true,
    vars: {
      "--background": "220 15% 5%",
      "--foreground": "210 20% 95%",
      "--card": "220 15% 7%",
      "--card-foreground": "210 20% 95%",
      "--popover": "220 15% 8%",
      "--popover-foreground": "210 20% 95%",
      "--primary": "210 15% 63%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "220 12% 12%",
      "--secondary-foreground": "210 20% 95%",
      "--muted": "220 12% 12%",
      "--muted-foreground": "215 10% 55%",
      "--accent": "220 12% 12%",
      "--accent-foreground": "210 20% 95%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "210 20% 95%",
      "--border": "220 10% 10%",
      "--input": "220 10% 10%",
      "--ring": "210 15% 63%",
    },
  },
]

type Theme = ThemeId

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  themeDef: ThemeDef
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function applyTheme(themeDef: ThemeDef) {
  const root = document.documentElement
  root.className = root.className.replace(/\b(dark|light)\b/g, "").trim()
  root.classList.add(themeDef.dark ? "dark" : "light")
  Object.entries(themeDef.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  root.style.setProperty("--ring", themeDef.vars["--ring"])
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("mbpw_theme") as Theme | null
    if (saved && THEMES.find((t) => t.id === saved)) {
      setThemeState(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const t = THEMES.find((x) => x.id === theme) || THEMES[0]
    applyTheme(t)
    localStorage.setItem("mbpw_theme", theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev)
      return THEMES[(idx + 1) % THEMES.length].id
    })
  }, [])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  const themeDef = THEMES.find((t) => t.id === theme) || THEMES[0]

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, isDark: themeDef.dark, toggleTheme, setTheme, themeDef }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { theme: "midnight" as Theme, isDark: true, toggleTheme: () => {}, setTheme: () => {}, themeDef: THEMES[0] }
  return ctx
}
