"use client"

import { CHORDS, type ChordType } from "@/lib/chords"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { chordLabel } from "@/lib/i18n/music-labels"

interface ChordTypeSelectorProps {
  value: string
  onChange: (chordId: string) => void
  chords?: readonly ChordType[]
  label?: string
}

export function ChordTypeSelector({
  value,
  onChange,
  chords = CHORDS,
  label,
}: ChordTypeSelectorProps) {
  const { locale, t } = useI18n()
  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}
    >
      <div
        className="mb-2.5 flex items-center justify-between text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>{label ?? t("chord")}</span>
        <span>{chords.length}</span>
      </div>
      <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">
        {chords.map((chord) => {
          const isSelected = value === chord.id
          return (
            <Button
              key={chord.id}
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange(chord.id)}
              className={cn(
                "h-auto w-full justify-start rounded-md px-[9px] py-[7px] text-left text-[12px] font-semibold",
                isSelected
                  ? "bg-[var(--accent-soft)] text-[var(--text)]"
                  : "text-[var(--text)] hover:bg-[var(--surface2)]"
              )}
              style={{
                border: isSelected
                  ? "1px solid var(--border-2)"
                  : "1px solid var(--border)",
                padding: "7px 9px",
              }}
              aria-pressed={isSelected}
            >
              {chordLabel(locale, chord.id, chord.name)}
              {chord.symbol && (
                <span
                  className="ml-1.5 text-[10px] font-medium"
                  style={{
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {chord.symbol}
                </span>
              )}
            </Button>
          )
        })}
      </div>
    </section>
  )
}
