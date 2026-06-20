"use client"

import { useState } from "react"
import { StringRow } from "./StringRow"
import { FretMarkers } from "./FretMarkers"
import { cn } from "@/lib/utils"
import type { FretNote } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"

interface FretboardProps {
  fretNotes: FretNote[][]
  fretCount: number
  showNoteNames?: boolean
  showIntervals?: boolean
  rootOnly?: boolean
  colorPreset: ColorPreset
  onNoteClick?: (note: FretNote) => void
  className?: string
}

const PRESETS: Record<
  ColorPreset,
  {
    bg: string
    nut: string
    text: string
    fretline: string
    marker: string
  }
> = {
  minimal: {
    bg: "var(--fretboard-minimal-bg)",
    nut: "var(--fretboard-minimal-nut)",
    text: "var(--fretboard-minimal-text)",
    fretline: "var(--fretboard-minimal-fret)",
    marker: "var(--fretboard-minimal-marker)",
  },
  natural: {
    bg: "var(--fretboard-natural-bg)",
    nut: "var(--fretboard-natural-nut)",
    text: "var(--fretboard-natural-text)",
    fretline: "var(--fretboard-natural-fret)",
    marker: "var(--fretboard-natural-marker)",
  },
  light: {
    bg: "var(--fretboard-light-bg)",
    nut: "var(--fretboard-light-nut)",
    text: "var(--fretboard-light-text)",
    fretline: "var(--fretboard-light-fret)",
    marker: "var(--fretboard-light-marker)",
  },
  dark: {
    bg: "var(--fretboard-dark-bg)",
    nut: "var(--fretboard-dark-nut)",
    text: "var(--fretboard-dark-text)",
    fretline: "var(--fretboard-dark-fret)",
    marker: "var(--fretboard-dark-marker)",
  },
  blue: {
    bg: "var(--fretboard-blue-bg)",
    nut: "var(--fretboard-blue-nut)",
    text: "var(--fretboard-blue-text)",
    fretline: "var(--fretboard-blue-fret)",
    marker: "var(--fretboard-blue-marker)",
  },
  purple: {
    bg: "var(--fretboard-purple-bg)",
    nut: "var(--fretboard-purple-nut)",
    text: "var(--fretboard-purple-text)",
    fretline: "var(--fretboard-purple-fret)",
    marker: "var(--fretboard-purple-marker)",
  },
  green: {
    bg: "var(--fretboard-green-bg)",
    nut: "var(--fretboard-green-nut)",
    text: "var(--fretboard-green-text)",
    fretline: "var(--fretboard-green-fret)",
    marker: "var(--fretboard-green-marker)",
  },
  red: {
    bg: "var(--fretboard-red-bg)",
    nut: "var(--fretboard-red-nut)",
    text: "var(--fretboard-red-text)",
    fretline: "var(--fretboard-red-fret)",
    marker: "var(--fretboard-red-marker)",
  },
}

export function Fretboard({
  fretNotes,
  fretCount,
  showNoteNames = true,
  showIntervals = false,
  rootOnly = false,
  colorPreset,
  onNoteClick,
  className,
}: FretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null)

  const colors = PRESETS[colorPreset]

  const getNoteKey = (stringIdx: number, fret: number) => `${stringIdx}-${fret}`

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[1100px] p-2">
        <div className="mb-2 flex">
          <div className="w-14 shrink-0" />
          {Array.from({ length: fretCount }, (_, i) => (
            <div
              key={i + 1}
              className="flex-1 text-center font-mono text-[10px] font-semibold"
              style={{
                color: "var(--foreground)",
                opacity: 1,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div
          className="relative overflow-hidden rounded-none"
          style={{ background: colors.bg }}
        >
          <div
            className="absolute top-0 bottom-0 left-14 z-10"
            style={{
              width: "3px",
              backgroundColor: colors.nut,
            }}
          />

          <FretMarkers fretCount={fretCount} colorPreset={colorPreset} />

          {fretNotes.map((notes, stringIndex) => (
            <StringRow
              key={stringIndex}
              stringIndex={stringIndex}
              fretNotes={notes}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              rootOnly={rootOnly}
              colorPreset={colorPreset}
              hoveredNote={hoveredNote}
              onNoteHover={setHoveredNote}
              onNoteClick={onNoteClick || (() => {})}
              getNoteKey={getNoteKey}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
