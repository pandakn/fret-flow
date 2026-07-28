"use client"

import type { ChordVoicing } from "@/lib/chord-voicings"

interface ChordVoicingSummaryProps {
  voicing?: ChordVoicing
}

export function ChordVoicingSummary({ voicing }: ChordVoicingSummaryProps) {
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
        Selected voicing
      </div>
      {voicing ? (
        <div className="flex flex-col gap-1.5">
          <div
            className="text-[12px] font-semibold"
            style={{ color: "var(--text)" }}
          >
            {voicing.label}
          </div>
          <div
            className="rounded-md px-2 py-1.5 text-[11px]"
            style={{
              backgroundColor: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
            aria-label={`Fingering: ${voicing.frets.map((fret) => fret ?? "X").join(", ")}`}
          >
            {voicing.frets.map((fret) => fret ?? "X").join(" · ")}
          </div>
          {voicing.barre && (
            <p
              className="text-[10px]"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Barre fret {voicing.barre.fret}, strings{" "}
              {6 - voicing.barre.fromString}–{6 - voicing.barre.toString}
            </p>
          )}
        </div>
      ) : (
        <p
          className="text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          No compatible voicing for this root and tuning.
        </p>
      )}
    </section>
  )
}
