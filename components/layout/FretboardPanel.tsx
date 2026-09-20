"use client"

import { Fretboard } from "@/components/fretboard/Fretboard"
import { useFretboard } from "@/components/fretboard/hooks/useFretboard"
import { useGuitarSound } from "@/components/fretboard/hooks/useGuitarSound"
import type { ChordVoicing } from "@/lib/chord-voicings"
import type { ResolvedArpeggio } from "@/lib/arpeggios"
import { getStringFrequencyAtFret, getTuningById } from "@/lib/tunings"
import type { FretNote, NoteName, TonalPattern } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"
import { useCallback } from "react"

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
  arpeggio?: ResolvedArpeggio
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
  arpeggio,
}: FretboardPanelProps) {
  const { fretNotesByString, fretCount } = useFretboard({
    root,
    pattern,
    tuningId,
    fretRange: { min: 0, max: 21 },
  })
  const { playNote } = useGuitarSound()
  const tuning = getTuningById(tuningId)
  const handleNoteClick = useCallback(
    (note: FretNote) => {
      if (!tuning) return

      const frequency = getStringFrequencyAtFret(tuning, note.string, note.fret)
      if (frequency !== undefined) void playNote(frequency)
    },
    [playNote, tuning]
  )

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
        arpeggio={arpeggio}
        onNoteClick={handleNoteClick}
      />
    </div>
  )
}
