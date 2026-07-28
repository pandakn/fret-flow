"use client"

import { getModeById, getModeContext } from "@/lib/scales"
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { ColorPresetPicker } from "./ColorPresetPicker"

interface ModeInfoProps {
  root: NoteName
  modeId: string
  colorPreset: ColorPreset
  onColorPresetChange: (preset: ColorPreset) => void
}

export function ModeInfo({
  root,
  modeId,
  colorPreset,
  onColorPresetChange,
}: ModeInfoProps) {
  const mode = getModeById(modeId)
  if (!mode) return null

  const context = getModeContext(root, mode)

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
          {root} {mode.name}
        </h1>
        <div
          className="mt-[3px] flex flex-wrap gap-x-3 gap-y-1 text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>
            Parent: {context.parentRoot} Major (degree {context.parentDegree})
          </span>
          <span>
            Characteristic tone: {context.characteristicNote} (
            {context.characteristicInterval})
          </span>
          <span>
            Fits: {root}
            {context.chordSymbol} ({context.chordLabel})
          </span>
        </div>
      </div>

      <ColorPresetPicker value={colorPreset} onChange={onColorPresetChange} />
    </header>
  )
}
