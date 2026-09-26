"use client"

import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n/LocaleProvider"

export type DisplayMode = "degrees" | "notes" | "rootOnly"

interface DisplayOptionsProps {
  value: DisplayMode
  onChange: (mode: DisplayMode) => void
}

const OPTIONS: { id: DisplayMode; label: "notes" | "degrees" | "rootOnly" }[] = [
  { id: "notes", label: "notes" },
  { id: "degrees", label: "degrees" },
  { id: "rootOnly", label: "rootOnly" },
]

export function DisplayOptions({ value, onChange }: DisplayOptionsProps) {
  const { t } = useI18n()
  return (
    <div
      className="inline-flex rounded-md"
      style={{
        border: "1px solid var(--border-2)",
        padding: "2px",
        gap: "2px",
      }}
      role="tablist"
      aria-label={t("displayMode")}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-sm text-[11px] font-bold transition-colors",
              active
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--text)]"
            )}
            style={{
              padding: "5px 11px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {t(opt.label)}
          </button>
        )
      })}
    </div>
  )
}
