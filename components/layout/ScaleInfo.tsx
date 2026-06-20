"use client"

import { CHROMATIC } from "@/lib/notes"
import { SCALES } from "@/lib/scales"
import { cn } from "@/lib/utils"
import type { NoteName } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"

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

const PRESET_PILLS: ColorPreset[] = [
  "minimal",
  "natural",
  "light",
  "dark",
  "blue",
  "purple",
  "green",
  "red",
]

const PRESET_COLOR: Record<ColorPreset, string> = {
  minimal: "#faf9f7",
  natural: "#8b5a2b",
  light: "#f5deb3",
  dark: "#3a2818",
  blue: "#1e3a5f",
  purple: "#4a3b69",
  green: "#2d5a3d",
  red: "#8b3a3a",
}

export function ScaleInfo({
  root,
  scaleId,
  colorPreset,
  onColorPresetChange,
}: ScaleInfoProps) {
  const scale = SCALES.find((s) => s.id === scaleId)
  if (!scale) return null

  const rootIndex = CHROMATIC.indexOf(root)
  const noteList = scale.intervals
    .map(
      (interval) =>
        CHROMATIC[(rootIndex + (SEMITONE_BY_INTERVAL[interval] ?? 0)) % 12]
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
          {root} {scale.name}
        </h1>
        <p
          className="mt-[3px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {noteList} &nbsp;·&nbsp; {scale.intervals.length} notes
        </p>
      </div>

      <div className="flex gap-1">
        {PRESET_PILLS.map((p) => (
          <button
            key={p}
            onClick={() => onColorPresetChange(p)}
            title={p}
            className={cn(
              "h-4 w-4 rounded-full transition-all",
              colorPreset === p ? "ring-2 ring-offset-1" : ""
            )}
            style={
              {
                backgroundColor: PRESET_COLOR[p],
                border: "1px solid var(--border-2)",
                ["--tw-ring-color" as string]:
                  colorPreset === p ? "var(--accent)" : undefined,
                ["--tw-ring-offset-color" as string]:
                  colorPreset === p ? "var(--surface)" : undefined,
              } as React.CSSProperties
            }
            aria-label={`Color preset: ${p}`}
            aria-pressed={colorPreset === p}
          />
        ))}
      </div>
    </header>
  )
}
