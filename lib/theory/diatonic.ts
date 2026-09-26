import type { NoteName } from "@/types/music"
import { getChordById, getChordNotes } from "../chords"
import { getScaleNotes } from "../scales"

export type DiatonicChordKind = "triad" | "seventh"
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type DiatonicChord = {
  degree: ScaleDegree
  romanNumeral: string
  chordId: string
  root: NoteName
  notes: NoteName[]
}

const MAJOR_SCALE_FORMULA = [2, 2, 1, 2, 2, 2, 1]

const TRIAD_CHORD_IDS = [
  "major",
  "minor",
  "minor",
  "major",
  "major",
  "minor",
  "diminished",
] as const

const SEVENTH_CHORD_IDS = [
  "major_7",
  "minor_7",
  "minor_7",
  "major_7",
  "dominant_7",
  "minor_7",
  "half_diminished_7",
] as const

const TRIAD_ROMAN_NUMERALS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
const SEVENTH_ROMAN_NUMERALS = [
  "Imaj7",
  "ii7",
  "iii7",
  "IVmaj7",
  "V7",
  "vi7",
  "viiø7",
]

/** Returns the seven chords built by stacking diatonic thirds in a major key. */
export const getDiatonicChords = (
  key: NoteName,
  kind: DiatonicChordKind
): DiatonicChord[] => {
  const scaleNotes = getScaleNotes(key, MAJOR_SCALE_FORMULA)
  const chordIds = kind === "triad" ? TRIAD_CHORD_IDS : SEVENTH_CHORD_IDS
  const romanNumerals =
    kind === "triad" ? TRIAD_ROMAN_NUMERALS : SEVENTH_ROMAN_NUMERALS

  return scaleNotes.map((root, index) => {
    const chordId = chordIds[index]
    const chord = getChordById(chordId)

    if (!chord) {
      throw new Error(`Missing chord definition for diatonic chord: ${chordId}`)
    }

    return {
      degree: (index + 1) as ScaleDegree,
      romanNumeral: romanNumerals[index],
      chordId,
      root,
      notes: getChordNotes(root, chord.formula),
    }
  })
}

/** Returns the seven diatonic triads in a major key. */
export const getDiatonicTriads = (key: NoteName): DiatonicChord[] =>
  getDiatonicChords(key, "triad")

/** Returns the seven diatonic seventh chords in a major key. */
export const getDiatonicSevenths = (key: NoteName): DiatonicChord[] =>
  getDiatonicChords(key, "seventh")
