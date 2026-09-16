"use client"

import { useState, type ReactNode } from "react"
import { Info } from "lucide-react"

interface TooltipProps {
  content: string
  children?: ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [show, setShow] = useState(false)

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children || <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 cursor-help transition-colors" />}
      {show && (
        <div className={`absolute z-50 ${sideClasses[side]}`}>
          <div className="px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl shadow-zinc-900/50">
            <p className="text-[11px] text-zinc-300 whitespace-nowrap max-w-[200px] truncate">{content}</p>
          </div>
        </div>
      )}
    </div>
  )
}
