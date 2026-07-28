"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { FretFlowLogo } from "@/components/brand/FretFlowLogo"
import { cn } from "@/lib/utils"

export type ExplorerMode = "scales" | "modes" | "chords"

const NAV_PILLS: { label: string; mode: ExplorerMode }[] = [
  { label: "Scales", mode: "scales" },
  { label: "Modes", mode: "modes" },
  { label: "Chords", mode: "chords" },
]

interface NavbarProps {
  mode: ExplorerMode
  onModeChange: (mode: ExplorerMode) => void
}

export function Navbar({ mode, onModeChange }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Standard next-themes hydration pattern. See:
    // https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[var(--surface)]"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex h-[49px] items-center justify-between px-6">
        <div className="flex items-center gap-7">
          <FretFlowLogo />

          <nav className="flex items-center gap-0.5">
            {NAV_PILLS.map((pill) => (
              <button
                key={pill.mode}
                onClick={() => onModeChange(pill.mode)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[11px] transition-colors",
                  mode === pill.mode
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--text)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
                aria-pressed={mode === pill.mode}
              >
                {pill.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-md px-3 py-1.5 text-[11px] text-[var(--muted-foreground)] transition-colors hover:text-[var(--text)]"
            style={{
              border: "1px solid var(--border-2)",
              fontFamily: "var(--font-mono)",
            }}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {mounted && isDark ? "Light" : "Dark"}
          </button>
          <button
            onClick={() => {
              /* preset save hook */
            }}
            className="rounded-md px-3 py-1.5 text-[11px] font-medium text-[var(--accent-foreground)]"
            style={{
              backgroundColor: "var(--accent)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Save preset
          </button>
        </div>
      </div>
    </header>
  )
}
