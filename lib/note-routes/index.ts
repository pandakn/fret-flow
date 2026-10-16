import { CHROMATIC } from "@/lib/notes"
import { getScaleById, getScaleNotes } from "@/lib/scales"
import {
  getStringFrequencyAtFret,
  getStringMidiAtFret,
  getTuningById,
} from "@/lib/tunings"
import type { IntervalName, NoteName } from "@/types/music"
import type {
  PlacedRouteShape,
  RouteAnswerClassification,
  RouteCoordinate,
  RouteOccurrence,
  RouteResult,
  ScaleRouteSelection,
  ScaleRouteSnapshot,
} from "@/types/note-routes"
import { CONNECTION, SHAPE_OFFSETS, supportsRouteSelection } from "./catalog"

const standard = getTuningById("standard")!
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
const identifier = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 256
const note = (value: unknown): value is NoteName =>
  typeof value === "string" && CHROMATIC.includes(value as NoteName)
const sameCoordinate = (a: RouteCoordinate, b: RouteCoordinate) =>
  a.string === b.string && a.fret === b.fret
const coordinate = (value: unknown): value is RouteCoordinate =>
  record(value) &&
  Number.isInteger(value.string) &&
  Number.isInteger(value.fret) &&
  (value.string as number) >= 0 &&
  (value.string as number) <= 5 &&
  (value.fret as number) >= 0 &&
  (value.fret as number) <= 21

export function validateScaleRouteSelection(
  value: unknown
): value is ScaleRouteSelection {
  return (
    record(value) &&
    note(value.root) &&
    (value.scaleId === "pentatonic_major" ||
      value.scaleId === "pentatonic_minor") &&
    value.tuningId === "standard" &&
    identifier(value.revision) &&
    identifier(value.pairId) &&
    identifier(value.placementId) &&
    (value.routeId === "shape-a" ||
      value.routeId === "shape-b" ||
      value.routeId === "connection") &&
    (value.direction === "ascending" || value.direction === "descending")
  )
}

const tones = (selection: ScaleRouteSelection): Map<NoteName, IntervalName> => {
  const scale = getScaleById(selection.scaleId)!
  return new Map(
    getScaleNotes(selection.root, scale.formula).map((n, i) => [
      n,
      scale.intervals[i],
    ])
  )
}

export function resolveScaleRoute(
  selection: ScaleRouteSelection
): RouteResult<ScaleRouteSnapshot> {
  if (!validateScaleRouteSelection(selection))
    return { ok: false, error: "Invalid route selection." }
  if (!supportsRouteSelection(selection))
    return {
      ok: false,
      error: "Unsupported route catalog revision, pair, or placement.",
    }
  const relativeMinor =
    (CHROMATIC.indexOf(selection.root) +
      (selection.scaleId === "pentatonic_major" ? 9 : 0)) %
    12
  const tonicFret = (relativeMinor - CHROMATIC.indexOf("E") + 12) % 12
  const base = tonicFret === 0 ? 12 : tonicFret
  const shapes = (["shape-a", "shape-b"] as const).map((id) => {
    const coordinates = SHAPE_OFFSETS[id].flatMap((frets, string) =>
      frets.map((fret) => ({ string, fret: base + fret }))
    )
    return {
      id,
      coordinates,
      minFret: Math.min(...coordinates.map((c) => c.fret)),
      maxFret: Math.max(...coordinates.map((c) => c.fret)),
    }
  }) as [PlacedRouteShape, PlacedRouteShape]
  const toneMap = tones(selection)
  const authored: {
    string: number
    fret: number
    shapeId: "shape-a" | "shape-b"
  }[] =
    selection.routeId === "connection"
      ? CONNECTION.map(([string, offset], i) => ({
          string,
          fret: base + offset,
          shapeId: i < 8 ? ("shape-a" as const) : ("shape-b" as const),
        }))
      : shapes
          .find((s) => s.id === selection.routeId)!
          .coordinates.map((c) => ({
            ...c,
            shapeId: selection.routeId as "shape-a" | "shape-b",
          }))
  let occurrences: RouteOccurrence[] = authored.map((c, i): RouteOccurrence => {
    const midi = getStringMidiAtFret(standard, c.string, c.fret)!
    const note = CHROMATIC[midi % 12]
    return {
      ...c,
      id: `${selection.routeId}-occurrence-${i}`,
      note,
      interval: toneMap.get(note)!,
      midi,
      frequency: getStringFrequencyAtFret(standard, c.string, c.fret)!,
    }
  })
  let transitions = occurrences.slice(1).map((o, i) => ({
    id: `${selection.routeId}-transition-${i}`,
    fromId: occurrences[i].id,
    toId: o.id,
    shift: selection.routeId === "connection" && i === 7,
  }))
  if (selection.direction === "descending") {
    occurrences = occurrences.reverse()
    transitions = transitions
      .reverse()
      .map((t) => ({ ...t, fromId: t.toId, toId: t.fromId }))
  }
  return {
    ok: true,
    value: { selection: { ...selection }, shapes, occurrences, transitions },
  }
}

export function classifyRouteAnswer(
  snapshot: ScaleRouteSnapshot,
  expected: RouteOccurrence,
  selected: RouteCoordinate
): RouteAnswerClassification {
  if (!coordinate(selected)) return "outside-scale"
  if (sameCoordinate(expected, selected)) return "exact"
  const midi = getStringMidiAtFret(standard, selected.string, selected.fret)!
  if (midi === expected.midi) return "same-pitch"
  if (CHROMATIC[midi % 12] === expected.note) return "same-note"
  return tones(snapshot.selection).has(CHROMATIC[midi % 12])
    ? "scale-tone"
    : "outside-scale"
}

export function getRouteQuestionId(
  snapshot: ScaleRouteSnapshot,
  transitionId: string
): string {
  const s = snapshot.selection
  const transition = snapshot.transitions.find((t) => t.id === transitionId)
  if (!transition) throw new Error("Unknown route transition.")
  return `scale-route:${JSON.stringify([s.revision, s.root, s.scaleId, s.tuningId, s.pairId, s.placementId, s.routeId, s.direction, transition.id, transition.fromId, transition.toId])}`
}

export function validateScaleRouteSnapshot(
  value: unknown
): value is ScaleRouteSnapshot {
  if (
    !record(value) ||
    !validateScaleRouteSelection(value.selection) ||
    !Array.isArray(value.shapes) ||
    value.shapes.length !== 2 ||
    !Array.isArray(value.occurrences) ||
    value.occurrences.length < 2 ||
    value.occurrences.length > 512 ||
    !Array.isArray(value.transitions) ||
    value.transitions.length !== value.occurrences.length - 1
  )
    return false
  const toneMap = tones(value.selection)
  const shapeIds = new Set<string>()
  const shapes = new Map<string, RouteCoordinate[]>()
  for (const shape of value.shapes) {
    if (
      !record(shape) ||
      (shape.id !== "shape-a" && shape.id !== "shape-b") ||
      shapeIds.has(shape.id) ||
      !Array.isArray(shape.coordinates) ||
      shape.coordinates.length < 6 ||
      shape.coordinates.length > 132 ||
      !shape.coordinates.every(coordinate)
    )
      return false
    const coordinates: RouteCoordinate[] = shape.coordinates
    const keys = coordinates.map((c) => `${c.string}:${c.fret}`)
    if (
      new Set(keys).size !== keys.length ||
      new Set(coordinates.map((c) => c.string)).size !== 6 ||
      shape.minFret !== Math.min(...coordinates.map((c) => c.fret)) ||
      shape.maxFret !== Math.max(...coordinates.map((c) => c.fret)) ||
      coordinates.some(
        (c) =>
          !toneMap.has(
            CHROMATIC[getStringMidiAtFret(standard, c.string, c.fret)! % 12]
          )
      )
    )
      return false
    shapeIds.add(shape.id)
    shapes.set(shape.id, coordinates)
  }
  const ids = new Set<string>()
  for (const occurrence of value.occurrences) {
    if (!record(occurrence) || !coordinate(occurrence)) return false
    const item = occurrence as RouteOccurrence
    if (
      !identifier(item.id) ||
      ids.has(item.id) ||
      (item.shapeId !== "shape-a" && item.shapeId !== "shape-b") ||
      !shapes.get(item.shapeId)?.some((c) => sameCoordinate(c, item))
    )
      return false
    const midi = getStringMidiAtFret(standard, item.string, item.fret)!
    const frequency = getStringFrequencyAtFret(
      standard,
      item.string,
      item.fret
    )!
    if (
      item.midi !== midi ||
      item.note !== CHROMATIC[midi % 12] ||
      !toneMap.has(item.note as NoteName) ||
      item.interval !== toneMap.get(item.note as NoteName) ||
      typeof item.frequency !== "number" ||
      !Number.isFinite(item.frequency) ||
      Math.abs(item.frequency - frequency) > frequency * 1e-10
    )
      return false
    ids.add(item.id)
  }
  const transitionIds = new Set<string>()
  for (let i = 0; i < value.transitions.length; i++) {
    const transition = value.transitions[i]
    if (
      !record(transition) ||
      !identifier(transition.id) ||
      transitionIds.has(transition.id) ||
      typeof transition.shift !== "boolean" ||
      transition.fromId !== value.occurrences[i].id ||
      transition.toId !== value.occurrences[i + 1].id
    )
      return false
    transitionIds.add(transition.id)
  }
  return true
}
