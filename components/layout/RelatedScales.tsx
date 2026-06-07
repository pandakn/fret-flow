"use client"

import { CHROMATIC } from "@/lib/notes"
import { SCALES } from "@/lib/scales"
import type { NoteName } from "@/types/music"

interface RelatedScalesProps {
  root: NoteName
  scaleId: string
}

interface Friend {
  id: string
  relativeShift?: number
  labelSuffix?: string
}

const SCALE_FRIEND: Record<string, Friend[]> = {
  pentatonic_major: [
    { id: "pentatonic_minor" },
    { id: "major" },
    { id: "natural_minor", relativeShift: 7, labelSuffix: " Natural Minor" },
  ],
  pentatonic_minor: [
    { id: "pentatonic_major" },
    { id: "natural_minor" },
    { id: "blues" },
  ],
  major: [
    { id: "natural_minor", relativeShift: 9, labelSuffix: " Natural Minor" },
    { id: "mixolydian" },
    { id: "lydian" },
  ],
  natural_minor: [
    { id: "major", relativeShift: 3, labelSuffix: " Major" },
    { id: "harmonic_minor" },
    { id: "dorian" },
  ],
  blues: [{ id: "pentatonic_minor" }, { id: "major" }, { id: "mixolydian" }],
  dorian: [
    { id: "major", relativeShift: 10, labelSuffix: " Major" },
    { id: "natural_minor" },
    { id: "mixolydian" },
  ],
  phrygian: [
    { id: "natural_minor" },
    { id: "harmonic_minor" },
    { id: "major", relativeShift: 1, labelSuffix: " Major" },
  ],
  lydian: [{ id: "major" }, { id: "mixolydian" }, { id: "dorian" }],
  mixolydian: [{ id: "major" }, { id: "dorian" }, { id: "pentatonic_major" }],
  harmonic_minor: [
    { id: "natural_minor" },
    { id: "phrygian" },
    { id: "major", relativeShift: 3, labelSuffix: " Major" },
  ],
}

export function RelatedScales({ root, scaleId }: RelatedScalesProps) {
  const friends = SCALE_FRIEND[scaleId] ?? [
    { id: "major" },
    { id: "natural_minor" },
    { id: "pentatonic_major" },
  ]

  const rootIndex = CHROMATIC.indexOf(root)

  const items = friends
    .map((f) => {
      const friend = SCALES.find((s) => s.id === f.id)
      if (!friend) return null
      const idx = (rootIndex + (f.relativeShift ?? 0)) % 12
      const noteRoot = CHROMATIC[idx]
      return `${noteRoot} ${friend.name}${f.labelSuffix ?? ""}`
    })
    .filter(Boolean) as string[]

  return (
    <section
      style={{
        padding: "0 16px 14px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="mb-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Related scales
      </div>
      <div className="flex flex-col gap-1">
        {items.map((label) => (
          <button
            key={label}
            className="rounded-md text-left text-[12px] font-semibold transition-colors hover:bg-[var(--surface2)]"
            style={{
              border: "1px solid var(--border)",
              padding: "7px 9px",
              color: "var(--text)",
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
