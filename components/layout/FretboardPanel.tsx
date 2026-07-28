"use client"

import { Fretboard } from "@/components/fretboard/Fretboard"
import { useFretboard } from "@/components/fretboard/hooks/useFretboard"
import type { ChordVoicing } from "@/lib/chord-voicings"
import type { NoteName, TonalPattern } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"

interface FretboardPanelProps {
  root: NoteName
  pattern?: TonalPattern
  tuningId: string
  focusRange?: { min: number; max: number }
  colorPreset: ColorPreset
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
  selectedVoicing?: ChordVoicing
  shapeFocus?: boolean
}

export function FretboardPanel({
  root,
  pattern,
  tuningId,
  focusRange,
  colorPreset,
  showNoteNames,
  showIntervals,
  rootOnly,
  selectedVoicing,
  shapeFocus = false,
}: FretboardPanelProps) {
  const { fretNotesByString, fretCount } = useFretboard({
    root,
    pattern,
    tuningId,
    fretRange: { min: 0, max: 21 },
  })

  return (
    <div className="flex flex-1 items-center justify-center">
      <Fretboard
        fretNotes={fretNotesByString}
        fretCount={fretCount}
        colorPreset={colorPreset}
        showNoteNames={showNoteNames}
        showIntervals={showIntervals}
        rootOnly={rootOnly}
        focusRange={focusRange}
        selectedVoicing={selectedVoicing}
        shapeFocus={shapeFocus}
      />
    </div>
  )
}
