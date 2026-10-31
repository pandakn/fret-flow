"use client"

import { cn } from "@/lib/utils"
import type { ChordVoicing } from "@/lib/chord-voicings"
import type { NoteName } from "@/types/music"
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
  tuningStrings: NoteName[]
  voicing?: ChordVoicing
  onToggleMutedString: (string: number) => void
  label?: string
}

export function ChordVoicingSelector({
  voicings,
  value,
  onChange,
  displayMode,
  onDisplayModeChange,
  tuningStrings,
  voicing,
  onToggleMutedString,
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
      {voicing ? (
        <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--foreground)]">
              {t("strumStrings")}
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {t("strumStringsHint")}
            </span>
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={t("strumStrings")}
          >
            {tuningStrings.map((note, string) => {
              const muted = voicing.frets[string] === null
              const stringNumber = tuningStrings.length - string
              return (
                <Button
                  key={`${string}-${note}`}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onToggleMutedString(string)}
                  aria-pressed={!muted}
                  aria-label={`${t("string")} ${stringNumber} ${note}: ${muted ? t("doNotStrum") : t("strum")}`}
                  className={cn(
                    "h-auto min-w-[3.5rem] flex-col gap-0.5 rounded-md px-2 py-1.5",
                    muted
                      ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  )}
                >
                  <span className="font-mono text-[10px]">
                    {note}
                    {string === 0
                      ? ` · ${t("lowString")}`
                      : string === tuningStrings.length - 1
                        ? ` · ${t("highString")}`
                        : ""}
                  </span>
                  <span className="text-[9px] font-semibold uppercase">
                    {muted ? "X" : voicing.frets[string]}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
