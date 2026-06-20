"use client"

import { SCALES } from "@/lib/scales"

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

const GENRE_BY_SCALE: Record<string, string> = {
  major: "Pop",
  natural_minor: "Rock",
  pentatonic_major: "Pop",
  pentatonic_minor: "Blues",
  blues: "Blues",
  dorian: "Jazz",
  phrygian: "Metal",
  lydian: "Film",
  mixolydian: "Rock",
  harmonic_minor: "Classical",
}

export function StatsGrid({ scaleId, stringCount = 6 }: StatsGridProps) {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return null

  const noteCount = scale.intervals.length
  const totalPositions = noteCount * stringCount
  const tonality = TONALITY_BY_SCALE[scaleId] ?? "—"
  const genre = GENRE_BY_SCALE[scaleId] ?? "—"

  return (
    <div
      className="grid grid-cols-2 gap-1.5"
      style={{ padding: "0 16px 14px" }}
    >
      <StatCard value={noteCount} label="Notes" />
      <StatCard value={totalPositions} label="Positions" />
      <StatCard value={tonality} label="Tonality" />
      <StatCard value={genre} label="Common in" />
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
