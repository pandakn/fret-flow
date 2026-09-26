"use client"

import type { ChordVoicing } from "@/lib/chord-voicings"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { voicingLabel } from "@/lib/i18n/music-labels"

interface ChordVoicingSummaryProps {
  voicing?: ChordVoicing
  label?: string
}

export function ChordVoicingSummary({
  voicing,
  label,
}: ChordVoicingSummaryProps) {
  const { locale, t } = useI18n()
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
        {t("selectedVoicing")}{label ? ` · ${label}` : ""}
      </div>
      {voicing ? (
        <div className="flex flex-col gap-1.5">
          <div
            className="text-[12px] font-semibold"
            style={{ color: "var(--text)" }}
          >
            {voicingLabel(locale, voicing)}
          </div>
          <div
            className="rounded-md px-2 py-1.5 text-[11px]"
            style={{
              backgroundColor: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
            }}
            aria-label={`${t("fingering")}: ${voicing.frets.map((fret) => fret ?? "X").join(", ")}`}
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
              {t("barreFret")} {voicing.barre.fret}, {t("strings")}{" "}
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
          {t("noVoicing")}
        </p>
      )}
    </section>
  )
}
