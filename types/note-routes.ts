import type { IntervalName, NoteName } from "@/types/music"

export type PentatonicScaleId = "pentatonic_major" | "pentatonic_minor"
export type ScaleRouteSelection = {
  root: NoteName
  scaleId: PentatonicScaleId
  tuningId: "standard"
  revision: "pentatonic-v1"
  pairId: "neighbor-boxes"
  placementId: "movable"
  routeId: "shape-a" | "shape-b" | "connection"
  direction: "ascending" | "descending"
}
export type RouteCoordinate = { string: number; fret: number }
export type RouteOccurrence = RouteCoordinate & {
  id: string
  note: NoteName
  interval: IntervalName
  midi: number
  frequency: number
  shapeId: "shape-a" | "shape-b"
}
export type PlacedRouteShape = {
  id: "shape-a" | "shape-b"
  minFret: number
  maxFret: number
  coordinates: RouteCoordinate[]
}
export type ScaleRouteSnapshot = {
  selection: ScaleRouteSelection
  shapes: [PlacedRouteShape, PlacedRouteShape]
  occurrences: RouteOccurrence[]
  transitions: { id: string; fromId: string; toId: string; shift: boolean }[]
}
export type RouteResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }
export type RouteAnswerClassification =
  | "exact"
  | "same-pitch"
  | "same-note"
  | "scale-tone"
  | "outside-scale"
export type RouteSubmission = {
  questionId: string
  transitionId: string
  occurrenceId: string
  submissionOrdinal: number
  selected: RouteCoordinate
  expected: RouteCoordinate
  assisted: boolean
}
export type ScaleRouteProgress = {
  phase: "check" | "guitar" | "finished"
  questionIds: string[]
  questionIndex: number
  submissionOrdinal: number
  assisted: boolean
  feedback: RouteAnswerClassification | null
  answered: boolean
  processedCommandIds: string[]
}
export type ScaleRouteAction = {
  id: string
  questionId: string
  submissionOrdinal: number
  at: string
} & (
  | { type: "hint" }
  | { type: "answer"; coordinate: RouteCoordinate }
  | { type: "next" }
  | { type: "participation"; status: "tried" | "skipped" }
)
export type ScaleRouteReport = {
  eligibleFirst: number
  correctFirst: number
  accuracy: number | null
  assistedFirst: number
  retries: number
  missedTransitionIds: string[]
  answeredQuestions: number
  totalQuestions: number
  participation: "tried" | "skipped" | null
}
