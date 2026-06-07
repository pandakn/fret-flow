"use client"

import { cn } from "@/lib/utils"
import type { NoteName } from "@/types/music"

interface KeySelectorProps {
  value: NoteName
  onChange: (key: NoteName) => void
}

const KEYS: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]

export function KeySelector({ value, onChange }: KeySelectorProps) {
  return (
    <section
      style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}
    >
      <div
        className="mb-2.5 text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        Root key
      </div>
      <div className="grid grid-cols-4 gap-1">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            type="button"
            className={cn(
              "rounded-md text-[12px] font-bold transition-colors",
              value === key
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--text)] hover:bg-[var(--surface2)]"
            )}
            style={{
              border: "1px solid var(--border)",
              padding: "7px 0",
              fontFamily: "var(--font-mono)",
            }}
            aria-pressed={value === key}
          >
            {key}
          </button>
        ))}
      </div>
    </section>
  )
}
