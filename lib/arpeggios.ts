import type { IntervalName, NoteName } from "@/types/music"
import {
  DEFAULT_CHORD_VOICING_FRET_RANGE,
  type ChordVoicing,
} from "./chord-voicings"
import { getChordNotes, type ChordType } from "./chords"
import { CHROMATIC, getNoteAtFret } from "./notes"
import { getStringFrequencyAtFret, type Tuning } from "./tunings"

export type ArpeggioDirection = "ascending" | "descending" | "upAndDown"

export type ArpeggioStep = {
  string: number
  fret: number
  note: NoteName
  interval: IntervalName
  /** Exact equal-temperament pitch for this string and fret. */
  frequency: number
  /** One-based order in the resolved picking sequence. */
  index: number
}

export type ResolvedArpeggio = {
  chord: ChordType
  voicing: ChordVoicing
  direction: ArpeggioDirection
  steps: ArpeggioStep[]
}

const isArpeggioDirection = (value: string): value is ArpeggioDirection =>
  value === "ascending" || value === "descending" || value === "upAndDown"

const isValidPosition = (
  position: { string: number; fret: number },
  tuning: Tuning
): boolean =>
  Number.isInteger(position.string) &&
  position.string >= 0 &&
  position.string < tuning.strings.length &&
  Number.isInteger(position.fret) &&
  position.fret >= DEFAULT_CHORD_VOICING_FRET_RANGE.min &&
  position.fret <= DEFAULT_CHORD_VOICING_FRET_RANGE.max

type UnresolvedArpeggioStep = {
  string: number
  fret: number
  note: NoteName
  interval: IntervalName | undefined
  frequency: number | undefined
}

type ResolvedArpeggioStep = UnresolvedArpeggioStep & {
  interval: IntervalName
  frequency: number
}

const hasResolvedInterval = (
  step: UnresolvedArpeggioStep
): step is ResolvedArpeggioStep =>
  step.interval !== undefined && step.frequency !== undefined

const hasMatchingActivePositions = (
  voicing: ChordVoicing,
  tuning: Tuning
): boolean => {
  if (voicing.frets.length !== tuning.strings.length) return false

  const expectedPositions = voicing.frets.flatMap((fret, string) =>
    fret === null ? [] : [{ string, fret }]
  )

  return (
    expectedPositions.length > 0 &&
    expectedPositions.length === voicing.activePositions.length &&
    expectedPositions.every(
      (position, index) =>
        position.string === voicing.activePositions[index]?.string &&
        position.fret === voicing.activePositions[index]?.fret
    )
  )
}

const getOrderedPositions = (
  positions: Array<{ string: number; fret: number }>,
  direction: ArpeggioDirection
): Array<{ string: number; fret: number }> => {
  const ascending = [...positions].sort((a, b) => a.string - b.string)

  if (direction === "ascending") return ascending
  if (direction === "descending") return [...ascending].reverse()
  if (ascending.length < 2) return ascending

  return [...ascending, ...ascending.slice(1, -1).reverse()]
}

/**
 * Resolves a chord voicing to an ordered low-to-high picking path. The
 * ascending path follows the tuning's low-to-high string order; descending
 * reverses it, and up-and-down returns without repeating either endpoint.
 */
export const resolveArpeggio = (
  voicing: ChordVoicing,
  chord: ChordType,
  tuning: Tuning,
  direction: ArpeggioDirection
): ResolvedArpeggio | undefined => {
  if (
    !isArpeggioDirection(direction) ||
    voicing.chordId !== chord.id ||
    voicing.tuningId !== tuning.id ||
    !CHROMATIC.includes(voicing.root) ||
    !hasMatchingActivePositions(voicing, tuning) ||
    !voicing.activePositions.every((position) =>
      isValidPosition(position, tuning)
    )
  ) {
    return undefined
  }

  const chordNotes = getChordNotes(voicing.root, chord.formula)
  const intervalByNote = new Map<NoteName, IntervalName>(
    chordNotes.map((note, index) => [note, chord.intervals[index]])
  )
  const orderedPositions = getOrderedPositions(
    voicing.activePositions,
    direction
  )

  const unresolvedSteps = orderedPositions.map((position) => {
    const note = getNoteAtFret(tuning.strings[position.string], position.fret)
    const interval = intervalByNote.get(note)
    const frequency = getStringFrequencyAtFret(
      tuning,
      position.string,
      position.fret
    )
    return { ...position, note, interval, frequency }
  })

  if (
    !unresolvedSteps.every(hasResolvedInterval) ||
    !unresolvedSteps.some((step) => step.note === voicing.root)
  ) {
    return undefined
  }

  const steps: ArpeggioStep[] = unresolvedSteps.map((step, index) => ({
    string: step.string,
    fret: step.fret,
    note: step.note,
    interval: step.interval,
    frequency: step.frequency,
    index: index + 1,
  }))

  return { chord, voicing, direction, steps }
}
