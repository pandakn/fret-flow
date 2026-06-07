"use client"

import { cn } from "@/lib/utils"

export type DisplayMode = "degrees" | "notes" | "rootOnly"

interface DisplayOptionsProps {
  value: DisplayMode
  onChange: (mode: DisplayMode) => void
}

const OPTIONS: { id: DisplayMode; label: string }[] = [
  { id: "degrees", label: "Degrees" },
  { id: "notes", label: "Notes" },
  { id: "rootOnly", label: "Root only" },
]

export function DisplayOptions({ value, onChange }: DisplayOptionsProps) {
  return (
    <div
      className="inline-flex rounded-md"
      style={{
        border: "1px solid var(--border-2)",
        padding: "2px",
        gap: "2px",
      }}
      role="tablist"
      aria-label="Display mode"
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
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
            style={{
              padding: "5px 11px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
