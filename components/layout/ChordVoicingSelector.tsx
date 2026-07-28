"use client"

import { cn } from "@/lib/utils"
import type { ChordVoicing, ChordVoicingPosition } from "@/lib/chord-voicings"
import { Button } from "@/components/ui/button"

export type ChordDisplayMode = "toneMap" | "shapeFocus"

const VOICING_GROUPS: {
  position: ChordVoicingPosition
  label: string
}[] = [
  { position: "open", label: "Open" },
  { position: "barre", label: "Barre" },
  { position: "up-neck", label: "Up-neck" },
]

interface ChordVoicingSelectorProps {
  voicings: ChordVoicing[]
  value?: string
  onChange: (voicingId: string) => void
  displayMode: ChordDisplayMode
  onDisplayModeChange: (mode: ChordDisplayMode) => void
}

export function ChordVoicingSelector({
  voicings,
  value,
  onChange,
  displayMode,
  onDisplayModeChange,
}: ChordVoicingSelectorProps) {
  return (
    <section
      style={{ borderTop: "1px solid var(--border)", padding: "10px 32px" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="text-[9px] font-semibold tracking-[0.14em] uppercase"
          style={{
            color: "var(--text)",
            opacity: 0.55,
            fontFamily: "var(--font-mono)",
          }}
        >
          Voicings
        </div>
        <div
          className="inline-flex rounded-md"
          style={{
            border: "1px solid var(--border-2)",
            gap: "2px",
            padding: "2px",
          }}
          role="group"
          aria-label="Chord map display"
        >
          {(
            [
              ["toneMap", "Tone map"],
              ["shapeFocus", "Shape focus"],
            ] as const
          ).map(([mode, label]) => (
            <Button
              key={mode}
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onDisplayModeChange(mode)}
              className={cn(
                "h-auto rounded-sm px-2.5 py-1 text-[10px] font-bold",
                displayMode === mode
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--text)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
              aria-pressed={displayMode === mode}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-4">
        {VOICING_GROUPS.map(({ position, label }) => {
          const choices = voicings.filter(
            (voicing) => voicing.position === position
          )
          return (
            <div key={position} className="flex min-w-0 flex-col gap-1">
              <span
                className="text-[9px] font-semibold uppercase"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {label}
              </span>
              <div
                className="flex flex-wrap gap-1"
                role="group"
                aria-label={`${label} voicings`}
              >
                {choices.length > 0 ? (
                  choices.map((voicing) => {
                    const isSelected = value === voicing.id
                    return (
                      <Button
                        key={voicing.id}
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => onChange(voicing.id)}
                        className={cn(
                          "h-auto rounded-md px-2 py-1 text-[10px] font-semibold",
                          isSelected
                            ? "bg-[var(--accent-soft)] text-[var(--text)]"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                        )}
                        style={{
                          border: isSelected
                            ? "1px solid var(--border-2)"
                            : "1px solid var(--border)",
                          fontFamily: "var(--font-mono)",
                        }}
                        aria-pressed={isSelected}
                      >
                        {voicing.label}
                      </Button>
                    )
                  })
                ) : (
                  <span
                    className="text-[10px]"
                    style={{
                      color: "var(--muted-foreground)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    None available
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
