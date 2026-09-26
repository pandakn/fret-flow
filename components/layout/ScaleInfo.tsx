"use client"

import { CHROMATIC } from "@/lib/notes"
import { SCALES } from "@/lib/scales"
import type { NoteName } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"
import { ColorPresetPicker } from "./ColorPresetPicker"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { scaleLabel } from "@/lib/i18n/music-labels"
import { getKeyLabel, spellIntervalNote } from "@/lib/theory/spelling"

interface ScaleInfoProps {
  root: NoteName
  scaleId: string
  colorPreset: ColorPreset
  onColorPresetChange: (preset: ColorPreset) => void
}

const SEMITONE_BY_INTERVAL: Record<string, number> = {
  R: 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  b5: 6,
  "#4": 6,
  "5": 7,
  b6: 8,
  "#5": 8,
  "6": 9,
  b7: 10,
  "7": 11,
}

export function ScaleInfo({
  root,
  scaleId,
  colorPreset,
  onColorPresetChange,
}: ScaleInfoProps) {
  const { locale, t } = useI18n()
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return null

  const rootIndex = CHROMATIC.indexOf(root)
  const noteList = scale.intervals
    .map((interval) =>
      spellIntervalNote(root, interval, CHROMATIC[(rootIndex + (SEMITONE_BY_INTERVAL[interval] ?? 0)) % 12])
    )
    .join(" · ")

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
          {getKeyLabel(root)} {scaleLabel(locale, scale.id, scale.name)}
        </h1>
        <p
          className="mt-[3px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {noteList} &nbsp;·&nbsp; {scale.intervals.length} {t("notes")}
        </p>
      </div>

      <ColorPresetPicker value={colorPreset} onChange={onColorPresetChange} />
    </header>
  )
}
