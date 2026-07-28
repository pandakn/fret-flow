"use client"

import { Button } from "@/components/ui/button"
import type { ChordVoicing, ChordVoicingPosition } from "@/lib/chord-voicings"
import { cn } from "@/lib/utils"

export const VOICING_GROUPS: ReadonlyArray<{
  position: ChordVoicingPosition
  label: string
}> = [
  { position: "open", label: "Open" },
  { position: "barre", label: "Barre" },
  { position: "up-neck", label: "Up-neck" },
]

interface VoicingGroupsProps {
  voicings: ChordVoicing[]
  value?: string
  onChange: (voicingId: string) => void
  ariaLabelSuffix?: string
}

/** Shared grouped voicing picker used by chord and arpeggio explorers. */
export function VoicingGroups({
  voicings,
  value,
  onChange,
  ariaLabelSuffix = "",
}: VoicingGroupsProps) {
  return (
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
              aria-label={`${label} ${ariaLabelSuffix}voicings`}
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
  )
}
