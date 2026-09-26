"use client"

import type { ResolvedArpeggio } from "@/lib/arpeggios"
import { getIntervalFamily, INTERVAL_FAMILY_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { spellIntervalNote } from "@/lib/theory/spelling"

interface ArpeggioSequenceProps {
  arpeggio?: ResolvedArpeggio
}

export function ArpeggioSequence({ arpeggio }: ArpeggioSequenceProps) {
  const { t } = useI18n()
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
        {t("pickingSequence")}
      </div>
      {arpeggio ? (
        <ol
          className="flex flex-col gap-1"
          aria-label={t("pickingSequence")}
        >
          {arpeggio.steps.map((step) => {
            const family = getIntervalFamily(step.interval)
            const color = family
              ? INTERVAL_FAMILY_COLORS[family]
              : "var(--color-deg1)"

            return (
              <li
                key={`${step.index}-${step.string}-${step.fret}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5",
                  step.interval === "R"
                    ? "bg-[var(--accent-soft)]"
                    : "bg-[var(--surface2)]"
                )}
                style={{
                  border:
                    step.interval === "R"
                      ? "1px solid var(--border-2)"
                      : "1px solid var(--border)",
                }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    backgroundColor: color,
                    color: "var(--surface)",
                    fontFamily: "var(--font-mono)",
                  }}
                  aria-hidden
                >
                  {step.index}
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {spellIntervalNote(arpeggio.voicing.root, step.interval, step.note)}
                </span>
                <span
                  className="ml-auto text-[10px]"
                  style={{
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {step.interval} · {t("string")} {step.string + 1} · {t("fret")} {step.fret}
                </span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p
          className="text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {t("noArpeggio")}
        </p>
      )}
    </section>
  )
}
