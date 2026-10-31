import type { NoteName } from "@/types/music"
import { CHROMATIC } from "../notes"

export const PROGRESSION_GENRES = [
  "pop",
  "rnb",
  "neo_soul",
  "blues",
  "funk",
] as const

export type ProgressionGenreId = (typeof PROGRESSION_GENRES)[number]

/**
 * Extended chord tone lists for the progression lab. These are deliberately
 * separate from `lib/chords.ts`: the fretboard modules require closed-octave
 * formulas, while these tone stacks may span one octave and a half (9th
 * chords). Semitones are relative to the chord root, ascending.
 */
const CHORD_TONE_SPECS = {
  maj: { quality: "", tones: [0, 4, 7], labels: ["R", "3", "5"] },
  maj6: { quality: "6", tones: [0, 4, 7, 9], labels: ["R", "3", "5", "6"] },
  m: { quality: "m", tones: [0, 3, 7], labels: ["R", "b3", "5"] },
  "7": { quality: "7", tones: [0, 4, 7, 10], labels: ["R", "3", "5", "b7"] },
  m7: { quality: "m7", tones: [0, 3, 7, 10], labels: ["R", "b3", "5", "b7"] },
  maj7: { quality: "maj7", tones: [0, 4, 7, 11], labels: ["R", "3", "5", "7"] },
  dom9: { quality: "9", tones: [0, 4, 7, 10, 14], labels: ["R", "3", "5", "b7", "9"] },
  m9: { quality: "m9", tones: [0, 3, 7, 10, 14], labels: ["R", "b3", "5", "b7", "9"] },
  maj9: { quality: "maj9", tones: [0, 4, 7, 11, 14], labels: ["R", "3", "5", "7", "9"] },
} as const

export type ChordToneId = keyof typeof CHORD_TONE_SPECS
export type ChordToneSpec = (typeof CHORD_TONE_SPECS)[ChordToneId]

export const getChordToneSpec = (
  id: ChordToneId | string
): ChordToneSpec | undefined =>
  id in CHORD_TONE_SPECS
    ? CHORD_TONE_SPECS[id as ChordToneId]
    : undefined

export type ProgressionStep = {
  /** Semitones of the chord root above the key root (0 = I, 5 = IV, -2 = bVII). */
  offset: number
  /** Chord tone stack id from `CHORD_TONE_SPECS`. */
  toneId: ChordToneId
  /** Display label for the scale step, e.g. "I", "bVII". */
  romanNumeral: string
  /** Bars the chord is held in 4/4. */
  bars: number
}

export type ProgressionId =
  | "pop_15_64"
  | "pop_64_15"
  | "pop_50s"
  | "pop_oda_royal"
  | "rnb_doo_wop"
  | "rnb_descend"
  | "rnb_vamp"
  | "neosoul_2_5_1"
  | "neosoul_1_4"
  | "neosoul_turnaround"
  | "neosoul_movie"
  | "blues_12bar"
  | "blues_12bar_quick"
  | "blues_minor"
  | "funk_1_4_vamp"
  | "funk_9ths"
  | "funk_one_chord"

export type Progression = {
  /** Stable, i18n-free id. Localized copy uses `prog<Id>` / `prog<Id>Description` keys. */
  id: ProgressionId
  genre: ProgressionGenreId
  bpm: number
  swing?: boolean
  steps: readonly ProgressionStep[]
}

const step = (
  offset: number,
  toneId: ChordToneId,
  romanNumeral: string,
  bars = 1
): ProgressionStep => ({ offset, toneId, romanNumeral, bars })

export const PROGRESSIONS: readonly Progression[] = [
  // ── Pop ──────────────────────────────────────────────────────────────
  {
    id: "pop_15_64",
    genre: "pop",
    bpm: 96,
    steps: [
      step(0, "maj", "I"),
      step(7, "maj", "V"),
      step(9, "m", "vi"),
      step(5, "maj", "IV"),
    ],
  },
  {
    id: "pop_64_15",
    genre: "pop",
    bpm: 100,
    steps: [
      step(9, "m", "vi"),
      step(5, "maj", "IV"),
      step(0, "maj", "I"),
      step(7, "maj", "V"),
    ],
  },
  {
    id: "pop_50s",
    genre: "pop",
    bpm: 92,
    steps: [
      step(0, "maj", "I"),
      step(9, "m", "vi"),
      step(5, "maj", "IV"),
      step(7, "maj", "V"),
    ],
  },
  {
    id: "pop_oda_royal",
    genre: "pop",
    bpm: 98,
    steps: [
      step(0, "maj", "I"),
      step(7, "maj", "V"),
      step(9, "m", "vi"),
      step(4, "m", "iii"),
      step(5, "maj", "IV"),
    ],
  },

  // ── RnB ──────────────────────────────────────────────────────────────
  {
    id: "rnb_doo_wop",
    genre: "rnb",
    bpm: 88,
    steps: [
      step(0, "maj7", "Imaj7"),
      step(9, "m7", "vi7"),
      step(2, "m7", "ii7"),
      step(7, "7", "V7"),
    ],
  },
  {
    id: "rnb_descend",
    genre: "rnb",
    bpm: 76,
    steps: [
      step(5, "maj7", "IVmaj7"),
      step(4, "m7", "iii7"),
      step(2, "m7", "ii7"),
      step(0, "maj9", "Imaj9"),
    ],
  },
  {
    id: "rnb_vamp",
    genre: "rnb",
    bpm: 92,
    steps: [
      step(0, "maj9", "Imaj9", 2),
      step(-2, "dom9", "bVII9", 2),
    ],
  },

  // ── Neo Soul ─────────────────────────────────────────────────────────
  {
    id: "neosoul_2_5_1",
    genre: "neo_soul",
    bpm: 74,
    steps: [
      step(2, "m9", "ii9"),
      step(7, "dom9", "V9"),
      step(0, "maj9", "Imaj9", 2),
    ],
  },
  {
    id: "neosoul_1_4",
    genre: "neo_soul",
    bpm: 70,
    steps: [
      step(0, "maj9", "Imaj9", 2),
      step(5, "m9", "IVm9", 2),
    ],
  },
  {
    id: "neosoul_turnaround",
    genre: "neo_soul",
    bpm: 72,
    steps: [
      step(0, "maj9", "Imaj9"),
      step(9, "m9", "vi9"),
      step(2, "m9", "ii9"),
      step(7, "dom9", "V9"),
    ],
  },
  {
    id: "neosoul_movie",
    genre: "neo_soul",
    bpm: 62,
    steps: [
      step(0, "maj7", "Imaj7"),
      step(-1, "m7", "vii m7"),
      step(-2, "maj6", "bVII6"),
      step(-3, "m7", "vi7"),
    ],
  },

  // ── Blues ────────────────────────────────────────────────────────────
  {
    id: "blues_12bar",
    genre: "blues",
    bpm: 84,
    swing: true,
    steps: [
      step(0, "7", "I7", 4),
      step(5, "7", "IV7", 2),
      step(0, "7", "I7", 2),
      step(7, "7", "V7"),
      step(5, "7", "IV7"),
      step(0, "7", "I7"),
      step(7, "7", "V7"),
    ],
  },
  {
    id: "blues_12bar_quick",
    genre: "blues",
    bpm: 96,
    swing: true,
    steps: [
      step(0, "7", "I7"),
      step(5, "7", "IV7"),
      step(0, "7", "I7", 2),
      step(5, "7", "IV7", 2),
      step(0, "7", "I7", 2),
      step(7, "7", "V7"),
      step(5, "7", "IV7"),
      step(0, "7", "I7"),
      step(7, "7", "V7"),
    ],
  },
  {
    id: "blues_minor",
    genre: "blues",
    bpm: 76,
    swing: true,
    steps: [
      step(0, "m7", "i7", 2),
      step(5, "m7", "iv7"),
      step(0, "m7", "i7"),
      step(-2, "7", "bVII7"),
      step(-4, "7", "bVI7"),
      step(-2, "7", "bVII7"),
      step(5, "m7", "iv7"),
      step(0, "m7", "i7"),
    ],
  },

  // ── Funk ─────────────────────────────────────────────────────────────
  {
    id: "funk_1_4_vamp",
    genre: "funk",
    bpm: 100,
    steps: [
      step(0, "7", "I7"),
      step(5, "7", "IV7"),
    ],
  },
  {
    id: "funk_9ths",
    genre: "funk",
    bpm: 104,
    steps: [
      step(0, "dom9", "I9"),
      step(5, "dom9", "IV9"),
    ],
  },
  {
    id: "funk_one_chord",
    genre: "funk",
    bpm: 104,
    steps: [
      step(0, "7", "I7", 3),
      step(-2, "7", "bVII7"),
    ],
  },
]

export const getProgressionGenres = (): readonly ProgressionGenreId[] =>
  PROGRESSION_GENRES

export const getProgressionsByGenre = (
  genre: ProgressionGenreId
): readonly Progression[] =>
  PROGRESSIONS.filter((progression) => progression.genre === genre)

export const getProgressionById = (
  id: string
): Progression | undefined => PROGRESSIONS.find((item) => item.id === id)

export const getProgressionLengthBeats = (
  progression: Progression
): number =>
  progression.steps.reduce(
    (beats, item) => beats + item.bars * 4,
    0
  )

/** Resolves the chord root of a step against the selected key. */
export const getStepRootNote = (
  step: ProgressionStep,
  key: NoteName
): NoteName => {
  const keyIndex = CHROMATIC.indexOf(key)
  if (keyIndex === -1) throw new Error(`Unknown key: ${key}`)

  return CHROMATIC[(((keyIndex + step.offset) % 12) + 12) % 12]
}

export type QuizRound = {
  /** The hidden progression to identify by ear. */
  targetId: string
  /** Always includes the target; 3–4 shuffled candidates. */
  optionIds: string[]
}

/**
 * Builds one ear-training round: a random progression of the genre, with
 * distractors drawn from the same genre first, then other genres.
 * Distractors are shuffled; the target always appears exactly once.
 */
export const getQuizRound = (
  genre: ProgressionGenreId,
  excludeId?: string,
  rng: () => number = Math.random
): QuizRound => {
  const inGenre = getProgressionsByGenre(genre)
  const eligible = inGenre.filter(
    (item) => item.id !== excludeId || inGenre.length === 1
  )
  const pool = eligible.length > 0 ? eligible : inGenre

  const target = pool[Math.floor(rng() * pool.length)]
  const others = PROGRESSIONS.filter((item) => item.id !== target.id)

  const sameGenre = others.filter((item) => item.genre === genre)
  const crossGenre = others.filter((item) => item.genre !== genre)

  const distractors: string[] = []
  while (distractors.length < 3 && sameGenre.length > 0) {
    distractors.push(...sameGenre.splice(Math.floor(rng() * sameGenre.length), 1).map((item) => item.id))
  }
  while (distractors.length < 3 && crossGenre.length > 0) {
    distractors.push(...crossGenre.splice(Math.floor(rng() * crossGenre.length), 1).map((item) => item.id))
  }

  const optionIds = shuffle([target.id, ...distractors], rng)
  return { targetId: target.id, optionIds }
}

const shuffle = (items: string[], rng: () => number): string[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
