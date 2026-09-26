"use client"

import { usePathname, useRouter } from "next/navigation"
import { useI18n } from "./LocaleProvider"
import type { Locale } from "@/lib/i18n/locales"
import { cn } from "@/lib/utils"

function persistLocale(next: Locale) {
  document.cookie = `ff_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
}

export function LocaleSwitcher() {
  const { locale, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  const changeLocale = (next: Locale) => {
    if (next === locale) return
    persistLocale(next)
    const segments = pathname.split("/")
    segments[1] = next
    router.push(`${segments.join("/")}${window.location.search}`)
  }

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-[var(--border-2)] p-0.5"
      role="group"
      aria-label={t("language")}
    >
      {(["en", "th"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => changeLocale(option)}
          aria-pressed={locale === option}
          lang={option}
          className={cn(
            "rounded px-1.5 py-1 font-mono text-[10px]",
            locale === option
              ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
              : "text-[var(--muted-foreground)]"
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
