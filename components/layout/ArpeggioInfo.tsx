"use client"

import type { ChordVoicing } from "@/lib/chord-voicings"
import { getChordById, getChordNotes } from "@/lib/chords"
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { ColorPresetPicker } from "./ColorPresetPicker"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { chordLabel, voicingLabel } from "@/lib/i18n/music-labels"
import { getKeyLabel, spellIntervalNote } from "@/lib/theory/spelling"

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
  const { locale, t } = useI18n()
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
          {getKeyLabel(root)}
          {chord.symbol} {chordLabel(locale, chord.id, chord.name)} {t("arpeggios")}
        </h1>
        <p
          className="mt-[3px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {notes.map((note, index) => spellIntervalNote(root, chord.intervals[index], note)).join(" · ")} &nbsp;·&nbsp; {chord.intervals.length} {t("tones")}
          {voicing ? ` · ${voicingLabel(locale, voicing)}` : ""}
        </p>
      </div>

      <ColorPresetPicker value={colorPreset} onChange={onColorPresetChange} />
    </header>
  )
}
