"use client"

import type { ChordVoicing } from "@/lib/chord-voicings"
import { getChordById, getChordNotes } from "@/lib/chords"
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { ColorPresetPicker } from "./ColorPresetPicker"

interface ArpeggioInfoProps {
  root: NoteName
  chordId: string
  voicing?: ChordVoicing
  colorPreset: ColorPreset
  onColorPresetChange: (preset: ColorPreset) => void
}

export function ArpeggioInfo({
  root,
  chordId,
  voicing,
  colorPreset,
  onColorPresetChange,
}: ArpeggioInfoProps) {
  const chord = getChordById(chordId)
  if (!chord) return null

  const notes = getChordNotes(root, chord.formula)

  return (
    <header
      className="flex items-center justify-between gap-4"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "12px 32px",
      }}
    >
      <div>
        <h1
          className="text-[20px] font-extrabold tracking-[-0.4px]"
          style={{ color: "var(--text)" }}
        >
          {root}
          {chord.symbol} {chord.name} Arpeggio
        </h1>
        <p
          className="mt-[3px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {notes.join(" · ")} &nbsp;·&nbsp; {chord.intervals.length} tones
          {voicing ? ` · ${voicing.label}` : ""}
        </p>
      </div>

      <ColorPresetPicker value={colorPreset} onChange={onColorPresetChange} />
    </header>
  )
}
