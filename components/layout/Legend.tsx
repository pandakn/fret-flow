"use client"

import {
  getIntervalFamily,
  INTERVAL_FAMILY_COLORS,
} from "@/lib/colors"
import type { IntervalName } from "@/types/music"

const SCALE_ITEMS: { family: 1 | 2 | 3 | 4; label: string }[] = [
  { family: 1, label: "Root (1)" },
  { family: 2, label: "2nd / 3rd" },
  { family: 3, label: "4th / 5th" },
  { family: 4, label: "6th / 7th" },
]

const CHORD_LABELS: Record<IntervalName, string> = {
  R: "Root (1)",
  b2: "Flat 2nd (b2)",
  "2": "2nd (2)",
  b3: "Minor 3rd (b3)",
  "3": "Major 3rd (3)",
  "4": "4th (4)",
  b5: "Diminished 5th (b5)",
  "#4": "Augmented 4th (#4)",
  "5": "5th (5)",
  b6: "Flat 6th (b6)",
  "#5": "Augmented 5th (#5)",
  "6": "6th (6)",
  b7: "Minor 7th (b7)",
  "7": "Major 7th (7)",
}

interface LegendProps {
  activeIntervals?: readonly IntervalName[]
}

export function Legend({ activeIntervals }: LegendProps) {
  const items = activeIntervals
    ? activeIntervals.flatMap((interval) => {
        const family = getIntervalFamily(interval)
        return family
          ? [{ key: interval, family, label: CHORD_LABELS[interval] }]
          : []
      })
    : SCALE_ITEMS.map(({ family, label }) => ({
        key: String(family),
        family,
        label,
      }))

  return (
    <div
      className="flex flex-wrap items-center gap-[14px] bg-[var(--surface)]"
      style={{ borderTop: "1px solid var(--border)", padding: "10px 32px" }}
    >
      <span
        className="text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Legend
      </span>
      {items.map(({ key, family, label }) => (
        <div
          key={key}
          className="flex items-center gap-[5px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div
            className="h-[9px] w-[9px] rounded-full"
            style={{ backgroundColor: INTERVAL_FAMILY_COLORS[family] }}
            aria-hidden
          />
          {label}
        </div>
      ))}
    </div>
  )
}
