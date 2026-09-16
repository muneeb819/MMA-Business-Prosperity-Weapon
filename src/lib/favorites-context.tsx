"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface FavoriteItem {
  id: string
  label: string
  href: string
  icon: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isFavorite: (href: string) => boolean
  toggleFavorite: (item: FavoriteItem) => void
  addFavorite: (item: FavoriteItem) => void
  removeFavorite: (href: string) => void
  recentPages: { href: string; label: string; timestamp: number }[]
  addRecentPage: (href: string, label: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [recentPages, setRecentPages] = useState<{ href: string; label: string; timestamp: number }[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mbpw_favorites")
      if (saved) setFavorites(JSON.parse(saved))
      const recent = localStorage.getItem("mbpw_recent")
      if (recent) setRecentPages(JSON.parse(recent))
    } catch {}
  }, [])

  useEffect(() => { localStorage.setItem("mbpw_favorites", JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { localStorage.setItem("mbpw_recent", JSON.stringify(recentPages.slice(0, 20))) }, [recentPages])

  const isFavorite = useCallback((href: string) => favorites.some((f) => f.href === href), [favorites])

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => prev.some((f) => f.href === item.href) ? prev.filter((f) => f.href !== item.href) : [...prev, item])
  }, [])

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => prev.some((f) => f.href === item.href) ? prev : [...prev, item])
  }, [])

  const removeFavorite = useCallback((href: string) => {
    setFavorites((prev) => prev.filter((f) => f.href !== href))
  }, [])

  const addRecentPage = useCallback((href: string, label: string) => {
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.href !== href)
      return [{ href, label, timestamp: Date.now() }, ...filtered].slice(0, 20)
    })
  }, [])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite, recentPages, addRecentPage }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) return { favorites: [], isFavorite: () => false, toggleFavorite: () => {}, addFavorite: () => {}, removeFavorite: () => {}, recentPages: [], addRecentPage: () => {} }
  return ctx
}
