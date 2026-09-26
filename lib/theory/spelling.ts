import type { IntervalName, NoteName } from "@/types/music"
import { CHROMATIC } from "../notes"
import { getScaleNotes } from "../scales"

export type DisplayNoteName =
  | NoteName
  | "Bb"
  | "Db"
  | "Eb"
  | "Gb"
  | "Ab"
  | "Cb"
  | "E#"
  | "B#"

const KEY_TONIC_SPELLINGS: Record<NoteName, DisplayNoteName> = {
  C: "C",
  "C#": "C#",
  D: "D",
  "D#": "Eb",
  E: "E",
  F: "F",
  "F#": "F#",
  G: "G",
  "G#": "Ab",
  A: "A",
  "A#": "Bb",
  B: "B",
}

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const
type NoteLetter = (typeof LETTERS)[number]

const NATURAL_PITCH_CLASSES: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const MAJOR_SCALE_FORMULA = [2, 2, 1, 2, 2, 2, 1]
const SHARP_SPELLINGS: Record<number, DisplayNoteName> = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B",
}
const FLAT_SPELLINGS: Record<number, DisplayNoteName> = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "Gb",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
}

const getPitchClass = (note: NoteName): number => CHROMATIC.indexOf(note)

const getLetterIndex = (letter: NoteLetter): number => LETTERS.indexOf(letter)

const getAccidentalForPitch = (
  letter: NoteLetter,
  pitchClass: number
): DisplayNoteName => {
  const difference = (pitchClass - NATURAL_PITCH_CLASSES[letter] + 12) % 12

  if (difference === 0) return letter
  if (difference === 1) return `${letter}#` as DisplayNoteName
  if (difference === 11) return `${letter}b` as DisplayNoteName

  // Major scale spellings should only need a natural, sharp, or flat. Keep a
  // deterministic enharmonic fallback if a future caller supplies another set.
  return SHARP_SPELLINGS[pitchClass]
}

const isFlatKey = (key: NoteName): boolean =>
  KEY_TONIC_SPELLINGS[key].includes("b")

/** Returns a reader-friendly tonic label while retaining sharp pitch-class IDs. */
export const getKeyLabel = (key: NoteName): DisplayNoteName =>
  KEY_TONIC_SPELLINGS[key]

/** Returns the major scale note spellings in scale-degree order for a key. */
export const getMajorScaleSpellings = (key: NoteName): DisplayNoteName[] => {
  const scaleNotes = getScaleNotes(key, MAJOR_SCALE_FORMULA)
  const tonic = getKeyLabel(key)
  const rootLetter = tonic[0] as NoteLetter
  const rootLetterIndex = getLetterIndex(rootLetter)

  return scaleNotes.map((note, index) => {
    const letter = LETTERS[(rootLetterIndex + index) % LETTERS.length]
    return getAccidentalForPitch(letter, getPitchClass(note))
  })
}

/** Spells a pitch in the selected major key, using its diatonic spelling when possible. */
export const spellNoteInKey = (
  key: NoteName,
  note: NoteName
): DisplayNoteName => {
  const scaleNotes = getScaleNotes(key, MAJOR_SCALE_FORMULA)
  const scaleIndex = scaleNotes.indexOf(note)

  if (scaleIndex !== -1) return getMajorScaleSpellings(key)[scaleIndex]

  const pitchClass = getPitchClass(note)
  return (isFlatKey(key) ? FLAT_SPELLINGS : SHARP_SPELLINGS)[pitchClass]
}

/** Spells a chord or scale tone by its interval letter, independent of the UI language. */
export const spellIntervalNote = (
  root: NoteName,
  interval: IntervalName,
  note: NoteName
): DisplayNoteName => {
  const tonicLetter = getKeyLabel(root)[0] as NoteLetter
  const degree = interval === "R" ? 1 : Number(interval.at(-1))
  const letter =
    LETTERS[(getLetterIndex(tonicLetter) + degree - 1) % LETTERS.length]
  return getAccidentalForPitch(letter, getPitchClass(note))
}
