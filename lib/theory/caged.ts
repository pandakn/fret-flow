import type { NoteName } from "@/types/music"
import { getNoteAtFret } from "../notes"
import { TUNINGS, type Tuning } from "../tunings"

export const CAGED_SHAPE_IDS = ["C", "A", "G", "E", "D"] as const
export type CagedShapeId = (typeof CAGED_SHAPE_IDS)[number]

export type CagedFretRange = { min: number; max: number }
export type CagedFretSlots = [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
]

export type CagedShapePosition = {
  shape: CagedShapeId
  root: NoteName
  anchorString: number
  anchorFret: number
  frets: CagedFretSlots
  minFret: number
  maxFret: number
  positions: Array<{
    string: number
    fret: number
    note: NoteName
    isRoot: boolean
  }>
}

export const DEFAULT_CAGED_FRET_RANGE: CagedFretRange = {
  min: 0,
  max: 21,
}

const SHAPE_OFFSETS: Record<
  CagedShapeId,
  { anchorString: number; offsets: CagedFretSlots }
> = {
  // Open C shape, moved from a root on the A string.
  C: { anchorString: 1, offsets: [null, 0, -1, -3, -2, -3] },
  // Open A shape, moved from a root on the A string.
  A: { anchorString: 1, offsets: [null, 0, 2, 2, 2, 0] },
  // Open G shape, moved from a root on the low E string.
  G: { anchorString: 0, offsets: [0, -1, -3, -3, -3, 0] },
  // Open E shape, moved from a root on the low E string.
  E: { anchorString: 0, offsets: [0, 2, 2, 1, 0, 0] },
  // Open D shape, moved from a root on the D string.
  D: { anchorString: 2, offsets: [null, null, 0, 2, 3, 2] },
}

const STANDARD_TUNING: Tuning = TUNINGS.find(
  (tuning) => tuning.id === "standard"
) ?? {
  id: "standard",
  name: "Standard",
  strings: ["E", "A", "D", "G", "B", "E"],
}

const isValidRange = (range: CagedFretRange): boolean =>
  Number.isInteger(range.min) &&
  Number.isInteger(range.max) &&
  range.min >= 0 &&
  range.max >= range.min

const getShapeAtAnchor = (
  shape: CagedShapeId,
  root: NoteName,
  anchorFret: number,
  fretRange: CagedFretRange
): CagedShapePosition | undefined => {
  const definition = SHAPE_OFFSETS[shape]
  const frets = definition.offsets.map((offset) =>
    offset === null ? null : anchorFret + offset
  ) as CagedFretSlots

  if (
    frets.some(
      (fret) => fret !== null && (fret < fretRange.min || fret > fretRange.max)
    )
  ) {
    return undefined
  }

  const positions = frets.flatMap((fret, string) => {
    if (fret === null) return []
    const note = getNoteAtFret(STANDARD_TUNING.strings[string], fret)
    return [{ string, fret, note, isRoot: note === root }]
  })

  if (!positions.some((position) => position.isRoot)) return undefined

  const activeFrets = positions.map((position) => position.fret)
  return {
    shape,
    root,
    anchorString: definition.anchorString,
    anchorFret,
    frets,
    minFret: Math.min(...activeFrets),
    maxFret: Math.max(...activeFrets),
    positions,
  }
}

/**
 * Returns the five movable major CAGED shapes on standard tuning, each at the
 * lowest fully visible root position in the requested fret range.
 */
export const getCagedMajorShapes = (
  root: NoteName,
  fretRange: CagedFretRange = DEFAULT_CAGED_FRET_RANGE
): CagedShapePosition[] => {
  if (!isValidRange(fretRange)) return []

  const shapes = CAGED_SHAPE_IDS.flatMap((shape) => {
    const { anchorString } = SHAPE_OFFSETS[shape]
    const openNote = STANDARD_TUNING.strings[anchorString]
    const candidate = Array.from(
      { length: fretRange.max - fretRange.min + 1 },
      (_, offset) => fretRange.min + offset
    ).find(
      (fret) =>
        getNoteAtFret(openNote, fret) === root &&
        getShapeAtAnchor(shape, root, fret, fretRange) !== undefined
    )

    if (candidate === undefined) return []
    const position = getShapeAtAnchor(shape, root, candidate, fretRange)
    return position ? [position] : []
  })

  return shapes.sort(
    (a, b) =>
      a.minFret - b.minFret ||
      CAGED_SHAPE_IDS.indexOf(a.shape) - CAGED_SHAPE_IDS.indexOf(b.shape)
  )
}
