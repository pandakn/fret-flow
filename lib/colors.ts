import type { IntervalName } from "@/types/music"

/**
 * 4-family interval color system (matches fretflow_light_minimal.html):
 *   deg1: root            (#1a1a1a — dark accent)
 *   deg2: 2nd / 3rd       (#7c6bff — purple)
 *   deg3: 4th / 5th       (#d85a30 — orange)
 *   deg4: 6th / 7th       (#1d9e75 — green)
 */
const FAMILY_BY_INTERVAL: Record<IntervalName, 1 | 2 | 3 | 4> = {
  R: 1,
  b2: 2,
  "2": 2,
  b3: 2,
  "3": 2,
  "4": 3,
  b5: 3,
  "#4": 3,
  "5": 3,
  b6: 3,
  "#5": 3,
  "6": 4,
  b7: 4,
  "7": 4,
}

export const INTERVAL_FAMILY_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "var(--color-deg1)",
  2: "var(--color-deg2)",
  3: "var(--color-deg3)",
  4: "var(--color-deg4)",
}

export const INTERVAL_COLORS: Record<string, string> = Object.fromEntries(
  (Object.entries(FAMILY_BY_INTERVAL) as [IntervalName, 1 | 2 | 3 | 4][]).map(
    ([interval, family]) => [interval, INTERVAL_FAMILY_COLORS[family]]
  )
)

export function getIntervalFamily(
  interval: IntervalName | null
): 1 | 2 | 3 | 4 | null {
  if (!interval) return null
  return FAMILY_BY_INTERVAL[interval] ?? null
}

export function getIntervalColor(interval: IntervalName | null): string {
  const family = getIntervalFamily(interval)
  return family ? INTERVAL_FAMILY_COLORS[family] : "var(--color-deg2)"
}
