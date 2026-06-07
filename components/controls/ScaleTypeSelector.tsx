"use client"

import { cn } from "@/lib/utils"
import { SCALES } from "@/lib/scales"

interface ScaleTypeSelectorProps {
  value: string
  onChange: (scaleId: string) => void
}

export function ScaleTypeSelector({ value, onChange }: ScaleTypeSelectorProps) {
  return (
    <section
      className="flex flex-col"
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        className="mb-2.5 flex items-center justify-between text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>Scale</span>
        <span>{SCALES.length}</span>
      </div>
      <div
        className="flex flex-col gap-1 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {SCALES.map((scale) => (
          <button
            key={scale.id}
            onClick={() => onChange(scale.id)}
            type="button"
            className={cn(
              "rounded-md text-left text-[12px] font-semibold transition-colors",
              value === scale.id
                ? "bg-[var(--accent-soft)] text-[var(--text)]"
                : "text-[var(--text)] hover:bg-[var(--surface2)]"
            )}
            style={{
              border:
                value === scale.id
                  ? "1px solid var(--border-2)"
                  : "1px solid var(--border)",
              padding: "7px 9px",
            }}
            aria-pressed={value === scale.id}
          >
            {scale.name}
          </button>
        ))}
      </div>
    </section>
  )
}
