import type { FretNote, NoteName, TonalPattern } from "@/types/music"
import { getNoteAtFret } from "./notes"
import { getScaleNotes } from "./scales"
import { getStringFrequencyAtFret, type Tuning } from "./tunings"

export const DEFAULT_FRET_RANGE = { min: 0, max: 15 }
export const EXPLORER_FRET_RANGE = { min: 0, max: 21 } as const
const DEFAULT_TUNING: NoteName[] = ["E", "A", "D", "G", "B", "E"]

const FRETLABEL_POSITIONS = [0, 3, 5, 7, 9, 12, 15]

const FRET_INLAYS = [3, 5, 7, 9, 12, 15]

export const getFretNotes = ({
  root,
  pattern,
  tuning = DEFAULT_TUNING,
  fretRange = DEFAULT_FRET_RANGE,
}: {
  root: NoteName
  pattern: TonalPattern
  tuning?: NoteName[]
  fretRange?: { min: number; max: number }
}): FretNote[] => {
  const patternNotes = getScaleNotes(root, pattern.formula)
  const notes: FretNote[] = []

  for (let stringIdx = 0; stringIdx < tuning.length; stringIdx++) {
    for (let fret = fretRange.min; fret <= fretRange.max; fret++) {
      const note = getNoteAtFret(tuning[stringIdx], fret)
      const intervalIndex = patternNotes.indexOf(note)
      const isActive = intervalIndex !== -1
      const isRoot = note === root

      notes.push({
        string: stringIdx,
        fret,
        note,
        interval: isActive ? pattern.intervals[intervalIndex] : null,
        isRoot,
        isActive,
      })
    }
  }

  return notes
}

/** Returns every highlighted fretboard position ordered by sounding pitch. */
export const getActiveFretNotesInPitchOrder = ({
  root,
  pattern,
  tuning,
  fretRange = EXPLORER_FRET_RANGE,
}: {
  root: NoteName
  pattern: TonalPattern
  tuning: Tuning
  fretRange?: { min: number; max: number }
}): FretNote[] => {
  return getFretNotes({
    root,
    pattern,
    tuning: tuning.strings,
    fretRange,
  })
    .filter((note) => note.isActive)
    .sort((a, b) => {
      const aFrequency = getStringFrequencyAtFret(tuning, a.string, a.fret)
      const bFrequency = getStringFrequencyAtFret(tuning, b.string, b.fret)

      if (
        aFrequency !== undefined &&
        bFrequency !== undefined &&
        aFrequency !== bFrequency
      ) {
        return aFrequency - bFrequency
      }

      return a.string - b.string || a.fret - b.fret
    })
}

export const getFretInlays = (
  fretRange: { min: number; max: number } = DEFAULT_FRET_RANGE
): number[] => {
  return FRET_INLAYS.filter(
    (fret) => fret >= fretRange.min && fret <= fretRange.max
  )
}

export const getFretLabelPositions = (
  fretRange: { min: number; max: number } = DEFAULT_FRET_RANGE
): number[] => {
  return FRETLABEL_POSITIONS.filter(
    (fret) => fret >= fretRange.min && fret <= fretRange.max
  )
}
