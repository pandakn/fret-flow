"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const NAV_PILLS = ["Scales", "Chords", "Arpeggios", "Modes"] as const
type NavPill = (typeof NAV_PILLS)[number]

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState<NavPill>("Scales")

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
          <div className="flex items-center gap-2">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-[4px]"
              style={{ border: "2px solid var(--text)" }}
            >
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--text)" }}
              />
            </div>
            <span
              className="text-[17px] font-extrabold tracking-[-0.5px]"
              style={{ color: "var(--text)" }}
            >
              FretFlow
            </span>
          </div>

          <nav className="flex items-center gap-0.5">
            {NAV_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={() => setActive(pill)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[11px] transition-colors",
                  active === pill
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
                aria-pressed={active === pill}
              >
                {pill}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-md px-3 py-1.5 text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
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
