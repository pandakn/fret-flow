"use client"

import { SCALES } from "@/lib/scales"
import { useI18n } from "@/components/i18n/LocaleProvider"
import type { MessageKey } from "@/lib/i18n/messages"

interface StatsGridProps {
  scaleId: string
  stringCount?: number
}

const TONALITY_BY_SCALE: Record<string, string> = {
  major: "Major",
  natural_minor: "Minor",
  pentatonic_major: "Major",
  pentatonic_minor: "Minor",
  blues: "Minor",
  dorian: "Minor",
  phrygian: "Minor",
  lydian: "Major",
  mixolydian: "Major",
  harmonic_minor: "Minor",
}

const GENRE_BY_SCALE: Record<string, MessageKey> = {
  major: "pop",
  natural_minor: "rock",
  pentatonic_major: "pop",
  pentatonic_minor: "blues",
  blues: "blues",
  dorian: "jazz",
  phrygian: "metal",
  lydian: "film",
  mixolydian: "rock",
  harmonic_minor: "classical",
}

export function StatsGrid({ scaleId, stringCount = 6 }: StatsGridProps) {
  const { t } = useI18n()
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return null

  const noteCount = scale.intervals.length
  const totalPositions = noteCount * stringCount
  const tonality = TONALITY_BY_SCALE[scaleId] === "Major" ? t("major") : t("minor")
  const genre = GENRE_BY_SCALE[scaleId] ? t(GENRE_BY_SCALE[scaleId]) : "—"

  return (
    <div
      className="grid grid-cols-2 gap-1.5"
      style={{ padding: "0 16px 14px" }}
    >
      <StatCard value={noteCount} label={t("notes")} />
      <StatCard value={totalPositions} label={t("positions")} />
      <StatCard value={tonality} label={t("tonality")} />
      <StatCard value={genre} label={t("commonIn")} />
    </div>
  )
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      className="rounded-md"
      style={{ backgroundColor: "var(--surface2)", padding: "9px 11px" }}
    >
      <div
        className="text-[18px] font-extrabold"
        style={{ color: "var(--text)" }}
      >
        {value}
      </div>
      <div
        className="mt-0.5 text-[9px] uppercase"
        style={{
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </div>
    </div>
  )
}
