import type { NoteName } from "@/types/music"

export const CIRCLE_KEYS: NoteName[] = [
  "C",
  "F",
  "A#",
  "D#",
  "G#",
  "C#",
  "F#",
  "B",
  "E",
  "A",
  "D",
  "G",
]
export const KEY_LABELS = [
  "C",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "B",
  "E",
  "A",
  "D",
  "G",
]
export const SHAPE_GROUPS = {
  caged: ["C", "A", "G", "E", "D"],
  scale: ["1", "2", "3", "4", "5", "6", "7"],
  triad: [
    "6–4 · root",
    "6–4 · 1st",
    "6–4 · 2nd",
    "5–3 · root",
    "5–3 · 1st",
    "5–3 · 2nd",
    "4–2 · root",
    "4–2 · 1st",
    "4–2 · 2nd",
    "3–1 · root",
    "3–1 · 1st",
    "3–1 · 2nd",
  ],
} as const
export type ShapeGroup = keyof typeof SHAPE_GROUPS
export type MasteryStatus = "learning" | "mastered"
export type ShapeMastery = Record<
  string,
  { status: MasteryStatus; updatedAt: string }
>
export const masteryKey = (
  group: ShapeGroup,
  shape: string,
  key: NoteName,
  quality = "major"
) => `${group}:${group === "triad" ? quality : "major"}:${shape}:${key}`
export function isShapeMastery(value: unknown): value is ShapeMastery {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false
  return Object.values(value).every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      "status" in entry &&
      (entry.status === "learning" || entry.status === "mastered") &&
      "updatedAt" in entry &&
      typeof entry.updatedAt === "string" &&
      Number.isFinite(Date.parse(entry.updatedAt))
  )
}
export function dailyShapeChallenge(mastery: ShapeMastery, day: string) {
  const candidates = SHAPE_GROUPS.caged.flatMap((shape) =>
    CIRCLE_KEYS.map((key) => ({
      shape,
      key,
      entry: mastery[masteryKey("caged", shape, key)],
    }))
  )
  const rank = (entry: ShapeMastery[string] | undefined) =>
    !entry ? 0 : entry.status === "learning" ? 1 : 2
  const lowest = Math.min(...candidates.map(({ entry }) => rank(entry)))
  const weak = candidates.filter(({ entry }) => rank(entry) === lowest)
  const oldest = Math.min(
    ...weak.map(({ entry }) => (entry ? Date.parse(entry.updatedAt) : 0))
  )
  const due = weak.filter(
    ({ entry }) => (entry ? Date.parse(entry.updatedAt) : 0) === oldest
  )
  const seed =
    [...day].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 0) >>> 0
  return due[seed % due.length]
}
