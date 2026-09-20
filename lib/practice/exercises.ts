import { CHROMATIC, getNoteAtFret } from "@/lib/notes"
import { getTuningById } from "@/lib/tunings"
import type {
  ConstructionExercise,
  ExerciseDefinition,
  FretboardPromptDirection,
  FretboardRecallExercise,
  PracticeAttempt,
  PracticeTarget,
} from "@/types/practice"
import type { IntervalName, NoteName } from "@/types/music"

export type RandomSource = () => number

const INTERVALS: IntervalName[] = [
  "R",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "b6",
  "6",
  "b7",
  "7",
]

const nowIso = () => new Date().toISOString()
const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const createDefaultExercise = (
  kind: ExerciseDefinition["kind"]
): ExerciseDefinition => {
  const base = {
    id: makeId(kind),
    createdAt: nowIso(),
    durationMinutes: 5,
  }

  switch (kind) {
    case "fretboardRecall":
      return {
        ...base,
        kind,
        name: "Fretboard recall",
        description: "Locate notes and intervals without visual hints.",
        recall: "note",
        promptDirection: "findPosition",
        root: "C",
        strings: [0, 1, 2, 3, 4, 5],
        fretRange: { min: 0, max: 12 },
        questionCount: 10,
      }
    case "tempoLadder":
      return {
        ...base,
        kind,
        name: "Tempo ladder",
        description: "Build clean speed one repeatable step at a time.",
        startBpm: 70,
        targetBpm: 110,
        increment: 5,
        repetitionsPerLevel: 3,
        subdivision: 2,
      }
    case "technique":
      return {
        ...base,
        kind,
        name: "Alternate picking",
        description: "Develop even attacks with a controlled scale sequence.",
        technique: "alternate-picking",
        root: "C",
        scaleId: "major",
        bpm: 80,
      }
    case "chordTransition":
      return {
        ...base,
        kind,
        name: "One-minute changes",
        description: "Measure clean changes between a focused chord pair.",
        chordA: "C",
        chordB: "G",
        mode: "one-minute",
        voicing: "open",
      }
    case "earTraining":
      return {
        ...base,
        kind,
        name: "Interval ear training",
        description: "Recognize intervals played with a guitar sound.",
        category: "interval",
        root: "C",
        questionCount: 8,
      }
    case "rhythm":
      return {
        ...base,
        kind,
        name: "Rhythm lock",
        description: "Tap against the pulse and reduce timing variation.",
        pattern: "eighths",
        bpm: 80,
        bars: 4,
        beatsPerBar: 4,
      }
    case "positionConnection":
      return {
        ...base,
        kind,
        name: "Connect positions",
        description: "Continue a scale across adjacent fretboard positions.",
        root: "C",
        scaleId: "major",
        fromPosition: 1,
        toPosition: 2,
      }
    case "construction":
      return {
        ...base,
        kind,
        name: "Build the interval",
        description: "Construct intervals and chords from a given root.",
        category: "interval",
        root: "C",
        questionCount: 8,
      }
  }
}

const boundedIndex = (length: number, random: RandomSource): number =>
  Math.min(length - 1, Math.floor(Math.max(0, random()) * length))

type RecallPromptBase = {
  id: string
  prompt: string
  expected: NoteName
  target: PracticeTarget
}

export type FindPositionRecallPrompt = RecallPromptBase & {
  direction: "findPosition"
  string?: number
}

export type NamePositionRecallPrompt = RecallPromptBase & {
  direction: "namePosition"
  position: { string: number; fret: number }
  choices: NoteName[]
}

export type RecallPrompt = FindPositionRecallPrompt | NamePositionRecallPrompt

export type RecallPromptTarget = {
  id: string
  direction: FretboardPromptDirection
  note: NoteName
  string?: number
  fret?: number
  root?: NoteName
  interval?: IntervalName
}

const shuffledNotes = (
  expected: NoteName,
  random: RandomSource
): NoteName[] => {
  const distractors = CHROMATIC.filter((note) => note !== expected)
  for (let index = distractors.length - 1; index > 0; index -= 1) {
    const next = boundedIndex(index + 1, random)
    ;[distractors[index], distractors[next]] = [
      distractors[next],
      distractors[index],
    ]
  }
  const choices = [expected, ...distractors.slice(0, 5)]
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const next = boundedIndex(index + 1, random)
    ;[choices[index], choices[next]] = [choices[next], choices[index]]
  }
  return choices
}

export const generateRecallPrompt = (
  exercise: FretboardRecallExercise,
  random: RandomSource = Math.random,
  weakTargets: readonly PracticeTarget[] = [],
  explicitTarget?: RecallPromptTarget
): RecallPrompt => {
  if (explicitTarget?.direction === "namePosition") {
    if (
      explicitTarget.string === undefined ||
      explicitTarget.fret === undefined
    ) {
      throw new Error("Name-position prompts require a fretboard coordinate")
    }
    return {
      id: makeId("prompt"),
      direction: "namePosition",
      prompt: `Name the note at string ${explicitTarget.string + 1}, fret ${explicitTarget.fret}`,
      expected: explicitTarget.note,
      position: {
        string: explicitTarget.string,
        fret: explicitTarget.fret,
      },
      choices: shuffledNotes(explicitTarget.note, random),
      target: {
        skill: "fretboardRecall",
        key: explicitTarget.id,
        string: explicitTarget.string,
        fret: explicitTarget.fret,
        note: explicitTarget.note,
        interval: explicitTarget.interval,
      },
    }
  }

  if (explicitTarget?.direction === "findPosition") {
    const label = explicitTarget.interval
      ? `${explicitTarget.interval} of ${explicitTarget.root ?? exercise.root}`
      : explicitTarget.note
    return {
      id: makeId("prompt"),
      direction: "findPosition",
      prompt: `Find ${label}${explicitTarget.string === undefined ? "" : ` on string ${explicitTarget.string + 1}`}`,
      expected: explicitTarget.note,
      string: explicitTarget.string,
      target: {
        skill: "fretboardRecall",
        key: explicitTarget.id,
        string: explicitTarget.string,
        note: explicitTarget.note,
        interval: explicitTarget.interval,
      },
    }
  }

  const direction =
    exercise.promptDirection === "mixed"
      ? random() < 0.5
        ? "findPosition"
        : "namePosition"
      : exercise.promptDirection

  if (direction === "namePosition") {
    const string =
      exercise.strings[boundedIndex(exercise.strings.length, random)]
    const fret =
      exercise.fretRange.min +
      boundedIndex(exercise.fretRange.max - exercise.fretRange.min + 1, random)
    const tuning = getTuningById("standard")
    if (!tuning) throw new Error("Standard tuning is required for recall")
    const expected = getNoteAtFret(tuning.strings[string], fret)
    return {
      id: makeId("prompt"),
      direction: "namePosition",
      prompt: `Name the note at string ${string + 1}, fret ${fret}`,
      expected,
      position: { string, fret },
      choices: shuffledNotes(expected, random),
      target: {
        skill: "fretboardRecall",
        key: `position:${string}-${fret}`,
        string,
        fret,
        note: expected,
      },
    }
  }

  const weak = weakTargets.filter(
    (target) => target.skill === "fretboardRecall"
  )
  const useWeak = weak.length > 0 && random() < 0.6
  const weakTarget = useWeak
    ? weak[boundedIndex(weak.length, random)]
    : undefined
  const note =
    weakTarget?.note ?? CHROMATIC[boundedIndex(CHROMATIC.length, random)]
  const interval =
    weakTarget?.interval ?? INTERVALS[boundedIndex(INTERVALS.length, random)]
  const rootIndex = CHROMATIC.indexOf(exercise.root)
  const expected =
    exercise.recall === "interval"
      ? CHROMATIC[(rootIndex + INTERVALS.indexOf(interval)) % CHROMATIC.length]
      : exercise.recall === "root"
        ? exercise.root
        : note
  const label =
    exercise.recall === "interval"
      ? `${interval} of ${exercise.root}`
      : exercise.recall === "root"
        ? `the root ${exercise.root}`
        : `every ${expected}`

  return {
    id: makeId("prompt"),
    direction: "findPosition",
    prompt: `Find ${label}`,
    expected,
    target: {
      skill: "fretboardRecall",
      key: `${exercise.recall}:${exercise.root}:${expected}`,
      note: expected,
      interval: exercise.recall === "interval" ? interval : undefined,
    },
  }
}

export const createAttempt = ({
  prompt,
  answer,
  expected,
  responseMs,
  target,
  verification = "app-verified",
  bpm,
  timingOffsetMs,
  correct,
}: {
  prompt: string
  answer: string
  expected: string
  responseMs: number
  target: PracticeTarget
  verification?: PracticeAttempt["verification"]
  bpm?: number
  timingOffsetMs?: number
  correct?: boolean
}): PracticeAttempt => ({
  id: makeId("attempt"),
  prompt,
  answer,
  expected,
  correct: correct ?? answer === expected,
  responseMs: Math.max(0, Math.round(responseMs)),
  createdAt: nowIso(),
  verification,
  target,
  bpm,
  timingOffsetMs,
})

export type ConstructionPrompt = {
  prompt: string
  choices: NoteName[]
  expected: NoteName
  interval: IntervalName
}

export const generateConstructionPrompt = (
  exercise: ConstructionExercise,
  random: RandomSource = Math.random
): ConstructionPrompt => {
  const interval = INTERVALS[1 + boundedIndex(INTERVALS.length - 1, random)]
  const expected =
    CHROMATIC[
      (CHROMATIC.indexOf(exercise.root) + INTERVALS.indexOf(interval)) % 12
    ]
  const choices = [expected]
  while (choices.length < 4) {
    const choice = CHROMATIC[boundedIndex(CHROMATIC.length, random)]
    if (!choices.includes(choice)) choices.push(choice)
  }
  choices.sort(() => random() - 0.5)

  return {
    prompt: `Which note is ${interval} above ${exercise.root}?`,
    choices,
    expected,
    interval,
  }
}
