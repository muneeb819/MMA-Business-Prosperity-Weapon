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
    accent: "#6366f1",
    dark: false,
    vars: {
      "--background": "0 0% 98%",
      "--foreground": "222.2 84% 4.9%",
      "--card": "0 0% 100%",
      "--card-foreground": "222.2 84% 4.9%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222.2 84% 4.9%",
      "--primary": "243 75% 59%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "243 25% 92%",
      "--secondary-foreground": "222.2 47.4% 11.2%",
      "--muted": "243 25% 92%",
      "--muted-foreground": "243 15% 40%",
      "--accent": "243 25% 92%",
      "--accent-foreground": "222.2 47.4% 11.2%",
      "--destructive": "0 72% 45%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "243 20% 88%",
      "--input": "243 20% 88%",
      "--ring": "243 75% 59%",
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    accent: "#6366f1",
    dark: true,
    vars: {
      "--background": "225 35% 5%",
      "--foreground": "220 30% 96%",
      "--card": "225 35% 7%",
      "--card-foreground": "220 30% 96%",
      "--popover": "225 35% 8%",
      "--popover-foreground": "220 30% 96%",
      "--primary": "225 80% 62%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "225 25% 12%",
      "--secondary-foreground": "220 30% 96%",
      "--muted": "225 25% 12%",
      "--muted-foreground": "220 15% 65%",
      "--accent": "225 25% 12%",
      "--accent-foreground": "220 30% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "220 30% 96%",
      "--border": "225 20% 12%",
      "--input": "225 20% 12%",
      "--ring": "225 80% 62%",
    },
  },
  {
    id: "forest",
    label: "Forest",
    accent: "#6366f1",
    dark: true,
    vars: {
      "--background": "195 30% 5%",
      "--foreground": "190 30% 96%",
      "--card": "195 30% 7%",
      "--card-foreground": "190 30% 96%",
      "--popover": "195 30% 8%",
      "--popover-foreground": "190 30% 96%",
      "--primary": "195 75% 55%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "195 22% 12%",
      "--secondary-foreground": "190 30% 96%",
      "--muted": "195 22% 12%",
      "--muted-foreground": "190 15% 65%",
      "--accent": "195 22% 12%",
      "--accent-foreground": "190 30% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "190 30% 96%",
      "--border": "195 18% 12%",
      "--input": "195 18% 12%",
      "--ring": "195 75% 55%",
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    accent: "#f43f5e",
    dark: true,
    vars: {
      "--background": "350 25% 5%",
      "--foreground": "350 20% 96%",
      "--card": "350 25% 7%",
      "--card-foreground": "350 20% 96%",
      "--popover": "350 25% 8%",
      "--popover-foreground": "350 20% 96%",
      "--primary": "350 89% 60%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "350 18% 12%",
      "--secondary-foreground": "350 20% 96%",
      "--muted": "350 18% 12%",
      "--muted-foreground": "350 12% 65%",
      "--accent": "350 18% 12%",
      "--accent-foreground": "350 20% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "350 20% 96%",
      "--border": "350 15% 12%",
      "--input": "350 15% 12%",
      "--ring": "350 89% 60%",
    },
  },
  {
    id: "lavender",
    label: "Lavender",
    accent: "#a855f7",
    dark: true,
    vars: {
      "--background": "270 30% 5%",
      "--foreground": "270 25% 96%",
      "--card": "270 30% 7%",
      "--card-foreground": "270 25% 96%",
      "--popover": "270 30% 8%",
      "--popover-foreground": "270 25% 96%",
      "--primary": "270 90% 66%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "270 22% 12%",
      "--secondary-foreground": "270 25% 96%",
      "--muted": "270 22% 12%",
      "--muted-foreground": "270 15% 65%",
      "--accent": "270 22% 12%",
      "--accent-foreground": "270 25% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "270 25% 96%",
      "--border": "270 18% 12%",
      "--input": "270 18% 12%",
      "--ring": "270 90% 66%",
    },
  },
  {
    id: "rose",
    label: "Rose",
    accent: "#f43f5e",
    dark: true,
    vars: {
      "--background": "340 28% 5%",
      "--foreground": "340 22% 96%",
      "--card": "340 28% 7%",
      "--card-foreground": "340 22% 96%",
      "--popover": "340 28% 8%",
      "--popover-foreground": "340 22% 96%",
      "--primary": "340 85% 60%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "340 18% 12%",
      "--secondary-foreground": "340 22% 96%",
      "--muted": "340 18% 12%",
      "--muted-foreground": "340 12% 65%",
      "--accent": "340 18% 12%",
      "--accent-foreground": "340 22% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "340 22% 96%",
      "--border": "340 15% 12%",
      "--input": "340 15% 12%",
      "--ring": "340 85% 60%",
    },
  },
  {
    id: "slate",
    label: "Slate",
    accent: "#818cf8",
    dark: true,
    vars: {
      "--background": "220 18% 5%",
      "--foreground": "220 20% 96%",
      "--card": "220 18% 7%",
      "--card-foreground": "220 20% 96%",
      "--popover": "220 18% 8%",
      "--popover-foreground": "220 20% 96%",
      "--primary": "220 70% 62%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "220 15% 12%",
      "--secondary-foreground": "220 20% 96%",
      "--muted": "220 15% 12%",
      "--muted-foreground": "220 12% 65%",
      "--accent": "220 15% 12%",
      "--accent-foreground": "220 20% 96%",
      "--destructive": "0 62.8% 30.6%",
      "--destructive-foreground": "220 20% 96%",
      "--border": "220 12% 12%",
      "--input": "220 12% 12%",
      "--ring": "220 70% 62%",
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
