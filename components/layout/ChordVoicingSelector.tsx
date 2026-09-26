"use client"

import { cn } from "@/lib/utils"
import type { ChordVoicing } from "@/lib/chord-voicings"
import { Button } from "@/components/ui/button"
import { VoicingGroups } from "./VoicingGroups"
import { useI18n } from "@/components/i18n/LocaleProvider"

export type ChordDisplayMode = "toneMap" | "shapeFocus"

interface ChordVoicingSelectorProps {
  voicings: ChordVoicing[]
  value?: string
  onChange: (voicingId: string) => void
  displayMode: ChordDisplayMode
  onDisplayModeChange: (mode: ChordDisplayMode) => void
  label?: string
}

export function ChordVoicingSelector({
  voicings,
  value,
  onChange,
  displayMode,
  onDisplayModeChange,
  label,
}: ChordVoicingSelectorProps) {
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
          aria-label={`${label ?? t("chord")} ${t("displayMode")}`}
        >
          {(
            [
              ["toneMap", t("toneMap")],
              ["shapeFocus", t("shapeFocus")],
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

      <VoicingGroups voicings={voicings} value={value} onChange={onChange} />
    </section>
  )
}
