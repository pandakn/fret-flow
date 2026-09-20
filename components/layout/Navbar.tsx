"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FretFlowLogo } from "@/components/brand/FretFlowLogo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ExplorerMode =
  | "scales"
  | "modes"
  | "chords"
  | "triads"
  | "arpeggios"

const NAV_PILLS: { label: string; mode: ExplorerMode }[] = [
  { label: "Scales", mode: "scales" },
  { label: "Modes", mode: "modes" },
  { label: "Chords", mode: "chords" },
  { label: "Triads", mode: "triads" },
  { label: "Arpeggios", mode: "arpeggios" },
]

interface NavbarProps {
  mode?: ExplorerMode
  onModeChange?: (mode: ExplorerMode) => void
  onSaveExercise?: () => void
}

const PRODUCT_LINKS = [
  { href: "/", label: "Explore" },
  { href: "/practice", label: "Practice" },
  { href: "/progress", label: "Progress" },
] as const

export function Navbar({ mode, onModeChange, onSaveExercise }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()
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
      <div className="flex h-[49px] items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-7">
          <Link href="/" aria-label="FretFlow home">
            <FretFlowLogo />
          </Link>

          <nav className="flex items-center gap-0.5" aria-label="Primary">
            {PRODUCT_LINKS.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="xs"
                asChild
                className={cn(
                  "rounded-full px-2 py-1.5 font-mono text-[10px] sm:px-3.5 sm:text-[11px]",
                  pathname === link.href
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          {mode && onModeChange ? (
            <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Explorer">
              {NAV_PILLS.map((pill) => (
              <Button
                key={pill.mode}
                type="button"
                variant="ghost"
                size="xs"
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
              </Button>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="hidden rounded-md px-3 py-1.5 text-[11px] text-[var(--muted-foreground)] transition-colors hover:text-[var(--text)] sm:block"
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
          {onSaveExercise ? (
            <button
              onClick={onSaveExercise}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--accent-foreground)]"
            >
              Save exercise
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
