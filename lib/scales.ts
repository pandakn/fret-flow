import type { IntervalName, NoteName, TonalPattern } from "@/types/music"
import { CHROMATIC } from "./notes"

export type ModeMetadata = {
  parentDegree: 2 | 3 | 4 | 5
  characteristicInterval: IntervalName
  chordSymbol: "m7" | "maj7" | "7"
  chordLabel: string
}

export type Scale = TonalPattern & {
  id: string
  name: string
  mode?: ModeMetadata
}

export type ModeScale = Scale & {
  mode: ModeMetadata
}

export const SCALES: Scale[] = [
  {
    id: "major",
    name: "Major",
    formula: [2, 2, 1, 2, 2, 2, 1],
    intervals: ["R", "2", "3", "4", "5", "6", "7"],
  },
  {
    id: "natural_minor",
    name: "Natural Minor",
    formula: [2, 1, 2, 2, 1, 2, 2],
    intervals: ["R", "2", "b3", "4", "5", "b6", "b7"],
  },
  {
    id: "pentatonic_major",
    name: "Major Pentatonic",
    formula: [2, 2, 3, 2, 3],
    intervals: ["R", "2", "3", "5", "6"],
  },
  {
    id: "pentatonic_minor",
    name: "Minor Pentatonic",
    formula: [3, 2, 2, 3, 2],
    intervals: ["R", "b3", "4", "5", "b7"],
  },
  {
    id: "blues",
    name: "Blues",
    formula: [3, 2, 1, 1, 3, 2],
    intervals: ["R", "b3", "4", "b5", "5", "b7"],
  },
  {
    id: "dorian",
    name: "Dorian",
    formula: [2, 1, 2, 2, 2, 1, 2],
    intervals: ["R", "2", "b3", "4", "5", "6", "b7"],
    mode: {
      parentDegree: 2,
      characteristicInterval: "6",
      chordSymbol: "m7",
      chordLabel: "minor 7",
    },
  },
  {
    id: "phrygian",
    name: "Phrygian",
    formula: [1, 2, 2, 2, 1, 2, 2],
    intervals: ["R", "b2", "b3", "4", "5", "b6", "b7"],
    mode: {
      parentDegree: 3,
      characteristicInterval: "b2",
      chordSymbol: "m7",
      chordLabel: "minor 7",
    },
  },
  {
    id: "lydian",
    name: "Lydian",
    formula: [2, 2, 2, 1, 2, 2, 1],
    intervals: ["R", "2", "3", "#4", "5", "6", "7"],
    mode: {
      parentDegree: 4,
      characteristicInterval: "#4",
      chordSymbol: "maj7",
      chordLabel: "major 7",
    },
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    formula: [2, 2, 1, 2, 2, 1, 2],
    intervals: ["R", "2", "3", "4", "5", "6", "b7"],
    mode: {
      parentDegree: 5,
      characteristicInterval: "b7",
      chordSymbol: "7",
      chordLabel: "dominant 7",
    },
  },
  {
    id: "harmonic_minor",
    name: "Harmonic Minor",
    formula: [2, 1, 2, 2, 1, 3, 1],
    intervals: ["R", "2", "b3", "4", "5", "b6", "7"],
  },
]

export const getScaleNotes = (
  root: NoteName,
  formula: number[]
): NoteName[] => {
  let i = CHROMATIC.indexOf(root)
  return [
    root,
    ...formula.slice(0, -1).map((step) => CHROMATIC[(i = (i + step) % 12)]),
  ]
}

export const getScaleById = (id: string): Scale | undefined =>
  SCALES.find((s) => s.id === id)

export const isMode = (scale: Scale): scale is ModeScale =>
  scale.mode !== undefined

export const MODES = SCALES.filter(isMode)

export const getModeById = (id: string): ModeScale | undefined =>
  MODES.find((mode) => mode.id === id)

const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11] as const
const INTERVAL_SEMITONES: Record<IntervalName, number> = {
  R: 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  b5: 6,
  "#4": 6,
  "5": 7,
  b6: 8,
  "#5": 8,
  "6": 9,
  b7: 10,
  "7": 11,
}

export const getModeContext = (root: NoteName, scale: ModeScale) => {
  const rootIndex = CHROMATIC.indexOf(root)
  const parentRoot =
    CHROMATIC[
      (rootIndex - MAJOR_DEGREE_SEMITONES[scale.mode.parentDegree - 1] + 12) %
        12
    ]
  const characteristicNote =
    CHROMATIC[
      (rootIndex + INTERVAL_SEMITONES[scale.mode.characteristicInterval]) % 12
    ]

  return {
    parentRoot,
    parentDegree: scale.mode.parentDegree,
    characteristicInterval: scale.mode.characteristicInterval,
    characteristicNote,
    chordSymbol: scale.mode.chordSymbol,
    chordLabel: scale.mode.chordLabel,
  }
}
