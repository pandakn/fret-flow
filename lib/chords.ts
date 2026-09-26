import type { IntervalName, NoteName, TonalPattern } from "@/types/music"
import { CHROMATIC } from "./notes"

export type ChordType = TonalPattern & {
  id: string
  name: string
  symbol: string
}

const chord = (
  id: string,
  name: string,
  symbol: string,
  formula: number[],
  intervals: IntervalName[]
): ChordType => ({ id, name, symbol, formula, intervals })

export const CHORDS: ChordType[] = [
  chord("major", "Major", "", [4, 3, 5], ["R", "3", "5"]),
  chord("minor", "Minor", "m", [3, 4, 5], ["R", "b3", "5"]),
  chord("dominant_7", "Dominant 7", "7", [4, 3, 3, 2], ["R", "3", "5", "b7"]),
  chord("minor_7", "Minor 7", "m7", [3, 4, 3, 2], ["R", "b3", "5", "b7"]),
  chord("major_7", "Major 7", "maj7", [4, 3, 4, 1], ["R", "3", "5", "7"]),
  chord(
    "half_diminished_7",
    "Half-Diminished 7",
    "ø7",
    [3, 3, 4, 2],
    ["R", "b3", "b5", "b7"]
  ),
  chord("diminished", "Diminished", "dim", [3, 3, 6], ["R", "b3", "b5"]),
  chord("augmented", "Augmented", "aug", [4, 4, 4], ["R", "3", "#5"]),
  chord("sus2", "Sus2", "sus2", [2, 5, 5], ["R", "2", "5"]),
  chord("sus4", "Sus4", "sus4", [5, 2, 5], ["R", "4", "5"]),
]

/** Returns chord types made up of exactly three distinct chord tones. */
export const getTriadChordTypes = (): ChordType[] =>
  CHORDS.filter((chordType) => chordType.intervals.length === 3)

export const getChordById = (id: string): ChordType | undefined =>
  CHORDS.find((chordType) => chordType.id === id)

export const getChordNotes = (
  root: NoteName,
  formula: number[]
): NoteName[] => {
  let index = CHROMATIC.indexOf(root)
  return [
    root,
    ...formula
      .slice(0, -1)
      .map((step) => CHROMATIC[(index = (index + step) % 12)]),
  ]
}
