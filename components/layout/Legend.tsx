"use client"

import { getIntervalFamily, INTERVAL_FAMILY_COLORS } from "@/lib/colors"
import type { IntervalName } from "@/types/music"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { intervalLabel } from "@/lib/i18n/music-labels"

const SCALE_ITEMS: { family: 1 | 2 | 3 | 4; label: string }[] = [
  { family: 1, label: "Root (1)" },
  { family: 2, label: "2nd / 3rd" },
  { family: 3, label: "4th / 5th" },
  { family: 4, label: "6th / 7th" },
]

interface LegendProps {
  activeIntervals?: readonly IntervalName[]
}

export function Legend({ activeIntervals }: LegendProps) {
  const { locale, t } = useI18n()
  const items = activeIntervals
    ? activeIntervals.flatMap((interval) => {
        const family = getIntervalFamily(interval)
        return family
          ? [{ key: interval, family, label: `${intervalLabel(locale, interval)} (${interval})` }]
          : []
      })
    : SCALE_ITEMS.map(({ family, label }) => ({
        key: String(family),
        family,
        label: locale === "th"
          ? family === 1 ? `${t("rootKey")} (1)` : family === 2 ? t("scaleFamily23") : family === 3 ? t("scaleFamily45") : t("scaleFamily67")
          : label,
      }))

  return (
    <div
      className="flex flex-wrap items-center gap-[14px] bg-[var(--surface)]"
      style={{ borderTop: "1px solid var(--border)", padding: "10px 32px" }}
    >
      <span
        className="text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{
          color: "var(--text)",
          opacity: 0.55,
          fontFamily: "var(--font-mono)",
        }}
      >
        {t("legend")}
      </span>
      {items.map(({ key, family, label }) => (
        <div
          key={key}
          className="flex items-center gap-[5px] text-[10px]"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div
            className="h-[9px] w-[9px] rounded-full"
            style={{ backgroundColor: INTERVAL_FAMILY_COLORS[family] }}
            aria-hidden
          />
          {label}
        </div>
      ))}
    </div>
  )
}
