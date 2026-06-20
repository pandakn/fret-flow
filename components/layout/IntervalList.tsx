"use client"

import { CHROMATIC } from "@/lib/notes"
import { getIntervalFamily, INTERVAL_FAMILY_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { NoteName } from "@/types/music"
import { SCALES } from "@/lib/scales"

const SEMITONE_BY_INTERVAL: Record<string, number> = {
  R: 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  b5: 6,
  "#4": 6,
  "5": 7,
  b6: 8,
  "#5": 8,
  "6": 9,
  b7: 10,
  "7": 11,
}

const INT_FULL_NAME: Record<string, string> = {
  R: "Root",
  b2: "m2",
  "2": "Maj2",
  b3: "m3",
  "3": "Maj3",
  "4": "P4",
  b5: "♭5",
  "#4": "♯4",
  "5": "P5",
  b6: "m6",
  "#5": "♯5",
  "6": "Maj6",
  b7: "m7",
  "7": "Maj7",
}

interface IntervalListProps {
  root: NoteName
  scaleId: string
}

export function IntervalList({ root, scaleId }: IntervalListProps) {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return null

  const rootIndex = CHROMATIC.indexOf(root)

  return (
    <section
      style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}
    >
      <div
        className="mb-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Intervals
      </div>
      <div id="intervalList" className="flex flex-col gap-0.5">
        {scale.intervals.map((interval) => {
          const note =
            CHROMATIC[(rootIndex + (SEMITONE_BY_INTERVAL[interval] ?? 0)) % 12]
          const family = getIntervalFamily(interval as never)
          const isRoot = interval === "R"
          const color = family
            ? INTERVAL_FAMILY_COLORS[family]
            : "var(--color-deg1)"
          return (
            <div
              key={interval}
              className={cn(
                "flex items-center justify-between rounded-md",
                isRoot
                  ? "bg-[var(--accent-soft)]"
                  : "hover:bg-[var(--surface2)]"
              )}
              style={{
                padding: "7px 8px",
                border: isRoot
                  ? "1px solid var(--border-2)"
                  : "1px solid transparent",
                transition: "background 0.1s",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: color,
                    opacity: isRoot ? 1 : 0.85,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {note}
                </span>
              </div>
              <div className="text-right">
                <div
                  className="rounded-sm px-1.5 py-0.5 text-[9px]"
                  style={{
                    backgroundColor: "var(--surface2)",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    display: "inline-block",
                  }}
                >
                  {interval}
                </div>
                <div
                  className="mt-0.5 text-[9px]"
                  style={{
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {INT_FULL_NAME[interval] ?? interval}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
