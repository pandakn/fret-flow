"use client"

import { cn } from "@/lib/utils"

const POSITIONS = [
  { id: "open", label: "Open", range: { min: 0, max: 4 } },
  { id: "2nd", label: "2nd", range: { min: 2, max: 5 } },
  { id: "5th", label: "5th", range: { min: 5, max: 8 } },
  { id: "7th", label: "7th", range: { min: 7, max: 10 } },
  { id: "9th", label: "9th", range: { min: 9, max: 12 } },
  { id: "12th", label: "12th", range: { min: 12, max: 15 } },
  { id: "full", label: "Full", range: { min: 0, max: 15 } },
] as const

export type PositionId = (typeof POSITIONS)[number]["id"]

export const POSITION_RANGES: Record<PositionId, { min: number; max: number }> =
  Object.fromEntries(POSITIONS.map((p) => [p.id, p.range])) as Record<
    PositionId,
    { min: number; max: number }
  >

interface PositionTabsProps {
  value: PositionId
  onChange: (id: PositionId) => void
}

export function PositionTabs({ value, onChange }: PositionTabsProps) {
  return (
    <div
      className="flex items-center gap-2.5 bg-[var(--surface)]"
      style={{ borderTop: "1px solid var(--border)", padding: "9px 32px" }}
    >
      <span
        className="text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Position
      </span>
      <div className="flex gap-0.5">
        {POSITIONS.map((pos) => (
          <button
            key={pos.id}
            onClick={() => onChange(pos.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[10px] transition-colors",
              value === pos.id
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
            style={{
              borderColor:
                value === pos.id ? "var(--accent)" : "var(--border-2)",
              borderStyle: "solid",
              borderWidth: "1px",
              fontFamily: "var(--font-mono)",
            }}
            aria-pressed={value === pos.id}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  )
}
