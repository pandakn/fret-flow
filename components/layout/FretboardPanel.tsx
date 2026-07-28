"use client"

import { Fretboard } from "@/components/fretboard/Fretboard"
import { useFretboard } from "@/components/fretboard/hooks/useFretboard"
import type { NoteName } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"

interface FretboardPanelProps {
  root: NoteName
  scaleId: string
  tuningId: string
  focusRange?: { min: number; max: number }
  colorPreset: ColorPreset
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
}

export function FretboardPanel({
  root,
  scaleId,
  tuningId,
  focusRange,
  colorPreset,
  showNoteNames,
  showIntervals,
  rootOnly,
}: FretboardPanelProps) {
  const { fretNotesByString, fretCount } = useFretboard({
    root,
    scaleId,
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
      />
    </div>
  )
}
