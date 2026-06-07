"use client"

import { cn } from "@/lib/utils"
import { TUNINGS } from "@/lib/tunings"

interface TuningSelectorProps {
  value: string
  onChange: (tuningId: string) => void
  className?: string
}

export function TuningSelector({
  value,
  onChange,
  className,
}: TuningSelectorProps) {
  const current = TUNINGS.find((t) => t.id === value)

  return (
    <section
      style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}
      className={className}
    >
      <div
        className="mb-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Tuning
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1">
          {TUNINGS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                "rounded-md text-[11px] font-bold transition-colors",
                value === t.id
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--text)] hover:bg-[var(--surface2)]"
              )}
              style={{
                border: "1px solid var(--border)",
                padding: "5px 7px",
                fontFamily: "var(--font-mono)",
                flex: "1 1 auto",
                minWidth: "22px",
              }}
              aria-pressed={value === t.id}
            >
              {t.strings.join(" ")}
            </button>
          ))}
        </div>
        {current && (
          <div
            className="text-[10px]"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            {current.name}
          </div>
        )}
      </div>
    </section>
  )
}
