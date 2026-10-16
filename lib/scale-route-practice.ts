import { CHROMATIC } from "@/lib/notes"
import {
  resolveScaleRoute,
  validateScaleRouteSelection,
} from "@/lib/note-routes"
import type { RouteResult, ScaleRouteSelection } from "@/types/note-routes"
import type { ScaleRouteExercise } from "@/types/practice"

const FIELDS = [
  "root",
  "scaleId",
  "tuningId",
  "revision",
  "pairId",
  "placementId",
  "routeId",
  "direction",
] as const

export const readScaleRoutePracticeRequest = (
  query: Record<string, string | string[] | undefined>
): RouteResult<ScaleRouteSelection> => {
  if (query.kind !== "scaleRoute")
    return { ok: false, error: "This is not a guided route link." }
  const values: Record<string, string> = {}
  for (const field of FIELDS) {
    const value = query[field]
    if (typeof value !== "string" || value.length === 0)
      return {
        ok: false,
        error: "Guided route link is incomplete or has repeated values.",
      }
    values[field] = value
  }
  const selection = Object.fromEntries(
    FIELDS.map((field) => [field, values[field]])
  )
  if (
    !CHROMATIC.includes(selection.root as (typeof CHROMATIC)[number]) ||
    !validateScaleRouteSelection(selection)
  )
    return {
      ok: false,
      error: "Guided route link contains an invalid selection.",
    }
  return { ok: true, value: selection }
}

export const encodeScaleRoutePracticeRequest = (
  selection: ScaleRouteSelection
): string => {
  const params = new URLSearchParams({ kind: "scaleRoute", ...selection })
  return `?${params.toString()}`
}

export const createScaleRouteExercise = (
  snapshot: ScaleRouteExercise["snapshot"],
  assessmentQuestionIds?: string[]
): ScaleRouteExercise => ({
  id: `scale-route-${snapshot.selection.root}-${snapshot.selection.scaleId}-${snapshot.selection.routeId}-${Date.now()}`,
  kind: "scaleRoute",
  name: `${snapshot.selection.root} ${snapshot.selection.scaleId === "pentatonic_minor" ? "minor" : "major"} pentatonic route`,
  description:
    "Study the ordered string-and-fret route, then check each transition without a timer.",
  durationMinutes: 5,
  createdAt: new Date().toISOString(),
  skillIds: ["scale.route"],
  snapshot: JSON.parse(
    JSON.stringify(snapshot)
  ) as ScaleRouteExercise["snapshot"],
  assessmentQuestionIds: assessmentQuestionIds
    ? [...assessmentQuestionIds]
    : undefined,
})

export const resolveScaleRoutePracticeRequest = (
  query: Record<string, string | string[] | undefined>
): RouteResult<ScaleRouteExercise> => {
  const request = readScaleRoutePracticeRequest(query)
  if (!request.ok) return request
  const resolved = resolveScaleRoute(request.value)
  if (!resolved.ok) return resolved
  return { ok: true, value: createScaleRouteExercise(resolved.value) }
}
