"use client"

import { useCallback, useMemo, useState } from "react"
import { StringRow } from "./StringRow"
import { FretMarkers } from "./FretMarkers"
import { cn } from "@/lib/utils"
import type { ChordVoicing } from "@/lib/chord-voicings"
import type { ResolvedArpeggio } from "@/lib/arpeggios"
import type { FretNote } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"

interface FretboardProps {
  fretNotes: FretNote[][]
  fretCount: number
  showNoteNames?: boolean
  showIntervals?: boolean
  rootOnly?: boolean
  focusRange?: { min: number; max: number }
  colorPreset: ColorPreset
  selectedVoicing?: ChordVoicing
  shapeFocus?: boolean
  arpeggio?: ResolvedArpeggio
  onNoteClick?: (note: FretNote) => void
  quizMode?: boolean
  quizFeedback?: {
    key: string
    status: "correct" | "incorrect"
  }
  quizTarget?: { string: number; fret: number }
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

const handleNoNoteClick = () => {}

export function Fretboard({
  fretNotes,
  fretCount,
  showNoteNames = true,
  showIntervals = false,
  rootOnly = false,
  focusRange,
  colorPreset,
  selectedVoicing,
  shapeFocus = false,
  arpeggio,
  onNoteClick,
  quizMode = false,
  quizFeedback,
  quizTarget,
  className,
}: FretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null)

  const colors = PRESETS[colorPreset]
  const selectedVoicingFrets = useMemo(() => {
    if (!selectedVoicing) return undefined

    const fretsByString = new Map<number, Set<number>>()
    for (const { string, fret } of selectedVoicing.activePositions) {
      let frets = fretsByString.get(string)
      if (!frets) {
        frets = new Set<number>()
        fretsByString.set(string, frets)
      }
      frets.add(fret)
    }

    return fretsByString
  }, [selectedVoicing])
  const isShapeFocus = shapeFocus && selectedVoicing !== undefined
  const arpeggioPathSteps = useMemo(() => {
    if (!arpeggio) return undefined

    const stepsByPosition = new Map<string, number[]>()
    for (const step of arpeggio.steps) {
      const positionKey = `${step.string}-${step.fret}`
      const indexes = stepsByPosition.get(positionKey)
      if (indexes) {
        indexes.push(step.index)
      } else {
        stepsByPosition.set(positionKey, [step.index])
      }
    }

    return stepsByPosition
  }, [arpeggio])
  const handleNoteHover = useCallback((noteKey: string | null) => {
    setHoveredNote(noteKey)
  }, [])

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
              focusRange={focusRange}
              colorPreset={colorPreset}
              selectedVoicingFrets={selectedVoicingFrets}
              selectedVoicingLabel={selectedVoicing?.label}
              shapeFocus={isShapeFocus}
              arpeggioPathSteps={arpeggioPathSteps}
              arpeggioStepCount={arpeggio?.steps.length ?? 0}
              hoveredNote={hoveredNote}
              onNoteHover={handleNoteHover}
              onNoteClick={onNoteClick ?? handleNoNoteClick}
              quizMode={quizMode}
              quizFeedback={quizFeedback}
              quizTarget={quizTarget}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
