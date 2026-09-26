"use client"

import { getChordById, getChordNotes } from "@/lib/chords"
import { getIntervalFamily, INTERVAL_FAMILY_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { NoteName } from "@/types/music"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { intervalLabel } from "@/lib/i18n/music-labels"
import { spellIntervalNote } from "@/lib/theory/spelling"

interface ChordToneListProps {
  root: NoteName
  chordId: string
  label?: string
}

export function ChordToneList({
  root,
  chordId,
  label,
}: ChordToneListProps) {
  const { locale, t } = useI18n()
  const chord = getChordById(chordId)
  if (!chord) return null

  const notes = getChordNotes(root, chord.formula)

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
        {label ?? t("chord")} {t("tones")}
      </div>
      <div className="flex flex-col gap-0.5">
        {chord.intervals.map((interval, index) => {
          const isRoot = interval === "R"
          const family = getIntervalFamily(interval)
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
                  aria-hidden
                />
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {spellIntervalNote(root, interval, notes[index])}
                </span>
              </div>
              <div className="text-right">
                <div
                  className="inline-block rounded-sm px-1.5 py-0.5 text-[9px]"
                  style={{
                    backgroundColor: "var(--surface2)",
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
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
                  {intervalLabel(locale, interval)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
