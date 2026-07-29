"use client"

import { type ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { AppShell } from "@/components/app-shell"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AppShell>{children}</AppShell>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
