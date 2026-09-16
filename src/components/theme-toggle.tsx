"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme, THEMES, type ThemeId } from "@/lib/theme-context"
import { Palette, Check } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme, themeDef } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Change theme">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1">
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          >
            <span
              className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ backgroundColor: t.accent, borderColor: t.accent }}
            >
              {theme === t.id && <Check className="h-3 w-3 text-white" />}
            </span>
            <span className="text-sm">{t.label}</span>
            {t.dark ? (
              <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Dark</span>
            ) : (
              <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Light</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
