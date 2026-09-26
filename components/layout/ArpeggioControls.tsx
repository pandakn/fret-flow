"use client"

import { Button } from "@/components/ui/button"
import type { ArpeggioDirection } from "@/lib/arpeggios"
import type { ChordVoicing } from "@/lib/chord-voicings"
import { cn } from "@/lib/utils"
import { VoicingGroups } from "./VoicingGroups"
import { useI18n } from "@/components/i18n/LocaleProvider"

const DIRECTIONS: { direction: ArpeggioDirection; label: "ascending" | "descending" | "upAndDown" }[] = [
  { direction: "ascending", label: "ascending" },
  { direction: "descending", label: "descending" },
  { direction: "upAndDown", label: "upAndDown" },
]

interface ArpeggioControlsProps {
  voicings: ChordVoicing[]
  value?: string
  onChange: (voicingId: string) => void
  direction: ArpeggioDirection
  onDirectionChange: (direction: ArpeggioDirection) => void
}

export function ArpeggioControls({
  voicings,
  value,
  onChange,
  direction,
  onDirectionChange,
}: ArpeggioControlsProps) {
  const { t } = useI18n()
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
          {t("voicings")}
        </div>
        <div
          className="inline-flex rounded-md"
          style={{
            border: "1px solid var(--border-2)",
            gap: "2px",
            padding: "2px",
          }}
          role="group"
          aria-label={t("direction")}
        >
          {DIRECTIONS.map(({ direction: option, label }) => (
            <Button
              key={option}
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onDirectionChange(option)}
              className={cn(
                "h-auto rounded-sm px-2.5 py-1 text-[10px] font-bold",
                direction === option
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--text)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
              aria-pressed={direction === option}
            >
              {t(label)}
            </Button>
          ))}
        </div>
      </div>

      <VoicingGroups
        voicings={voicings}
        value={value}
        onChange={onChange}
        ariaLabelSuffix="arpeggio "
      />
    </section>
  )
}
