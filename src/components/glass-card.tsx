"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: "blue" | "purple" | "emerald" | "none"
  hover?: boolean
  delay?: number
}

export function GlassCard({
  children,
  className = "",
  glow = "none",
  hover = true,
  delay = 0,
}: GlassCardProps) {
  const glowClass =
    glow === "blue"
      ? "glow-blue"
      : glow === "purple"
        ? "glow-purple"
        : glow === "emerald"
          ? "glow-emerald"
          : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`
        relative overflow-hidden rounded-xl border border-white/[0.06]
        bg-gradient-to-br from-white/[0.06] to-white/[0.02]
        backdrop-blur-xl ${glowClass}
        ${hover ? "card-hover cursor-pointer" : ""}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  )
}

export function GlassCardHeader({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`px-5 py-4 border-b border-white/[0.06] ${className}`}>
      {children}
    </div>
  )
}

export function GlassCardContent({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}
