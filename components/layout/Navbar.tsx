"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FretFlowLogo } from "@/components/brand/FretFlowLogo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher"
import { localePath } from "@/lib/i18n/locales"

export type ExplorerMode =
  | "scales"
  | "modes"
  | "chords"
  | "triads"
  | "arpeggios"

const NAV_PILLS: { label: "scales" | "modes" | "chords" | "triads" | "arpeggios"; mode: ExplorerMode }[] = [
  { label: "scales", mode: "scales" },
  { label: "modes", mode: "modes" },
  { label: "chords", mode: "chords" },
  { label: "triads", mode: "triads" },
  { label: "arpeggios", mode: "arpeggios" },
]

interface NavbarProps {
  mode?: ExplorerMode
  onModeChange?: (mode: ExplorerMode) => void
  onSaveExercise?: () => void
}

const PRODUCT_LINKS = [
  { href: "", label: "explore" },
  { href: "/learn", label: "learn" },
  { href: "/practice", label: "practice" },
  { href: "/progress", label: "progress" },
] as const

export function Navbar({ mode, onModeChange, onSaveExercise }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()
  const { locale, t } = useI18n()
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
          <Link href={localePath(locale)} aria-label="FretFlow home">
            <FretFlowLogo />
          </Link>

          <nav className="flex items-center gap-0.5" aria-label="Primary">
            {PRODUCT_LINKS.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="xs"
                asChild
                className={cn(
                  "rounded-full px-2 py-1.5 font-mono text-[10px] sm:px-3.5 sm:text-[11px]",
                  pathname === localePath(locale, link.href) ||
                    (link.href === "/learn" && pathname.startsWith(localePath(locale, "/learn/")))
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Link href={localePath(locale, link.href)}>{t(link.label)}</Link>
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
                {t(pill.label)}
              </Button>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="hidden rounded-md px-3 py-1.5 text-[11px] text-[var(--muted-foreground)] transition-colors hover:text-[var(--text)] sm:block"
            style={{
              border: "1px solid var(--border-2)",
              fontFamily: "var(--font-mono)",
            }}
            aria-label={
              isDark ? t("switchToLight") : t("switchToDark")
            }
          >
            {mounted && isDark ? t("light") : t("dark")}
          </button>
          {onSaveExercise ? (
            <button
              onClick={onSaveExercise}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--accent-foreground)]"
            >
              {t("saveExercise")}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
