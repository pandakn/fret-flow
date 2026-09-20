import type { IntervalName, NoteName } from "@/types/music"

export const PRACTICE_SCHEMA_VERSION = 3 as const

export type ExerciseKind =
  | "fretboardRecall"
  | "tempoLadder"
  | "technique"
  | "chordTransition"
  | "earTraining"
  | "rhythm"
  | "positionConnection"
  | "construction"

export type VerificationKind = "self-reported" | "app-verified"
export type SessionStatus =
  | "ready"
  | "running"
  | "paused"
  | "completed"
  | "abandoned"

export type ChallengeSlot = "warmup" | "weakSpot" | "wildcard"
export type ChallengeDifficulty = "steady" | "stretch" | "bold"

export type ChallengeGoal =
  | { metric: "accuracy"; target: number; baseline?: number }
  | { metric: "responseTime"; target: number; baseline?: number }
  | { metric: "timingVariability"; target: number; baseline?: number }
  | {
      metric: "cleanCount"
      target: number
      baseline?: number
      label: "clean rounds" | "clean changes"
    }
  | { metric: "bpm"; target: number; baseline?: number }

export type DailyMission = {
  id: string
  dayKey: string
  slot: ChallengeSlot
  title: string
  description: string
  reason: string
  difficulty: ChallengeDifficulty
  durationMinutes: number
  modifierLabel: string
  exercise: ExerciseDefinition
  goal: ChallengeGoal
}

export type SessionChallenge = Pick<
  DailyMission,
  "id" | "dayKey" | "slot" | "title" | "goal" | "modifierLabel"
>

export type DailyChallengeState = {
  dayKey: string
  wildcardRerolls: number
  wildcardSeed: number
}

type ExerciseBase = {
  id: string
  name: string
  description: string
  durationMinutes: number
  createdAt: string
}

export type FretboardPromptDirection = "findPosition" | "namePosition"
export type FretboardPromptMode = FretboardPromptDirection | "mixed"

export type FretboardPathStageId =
  | "landmarks"
  | "natural-map"
  | "chromatic-map"
  | "interval-map"
  | "position-links"

export type PracticePathMetadata = {
  pathId: "fretboard"
  stageId: FretboardPathStageId
  checkpoint: boolean
  targetIds: string[]
}

export type FretboardRecallExercise = ExerciseBase & {
  kind: "fretboardRecall"
  recall: "note" | "root" | "interval"
  promptDirection: FretboardPromptMode
  root: NoteName
  strings: number[]
  fretRange: { min: number; max: number }
  questionCount: number
  path?: PracticePathMetadata
}

export type TempoLadderExercise = ExerciseBase & {
  kind: "tempoLadder"
  startBpm: number
  targetBpm: number
  increment: number
  repetitionsPerLevel: number
  subdivision: 1 | 2 | 3 | 4
  gapEveryBars?: number
}

export type TechniqueExercise = ExerciseBase & {
  kind: "technique"
  technique:
    | "alternate-picking"
    | "legato"
    | "string-crossing"
    | "scale-sequence"
    | "arpeggio"
  root: NoteName
  scaleId: string
  bpm: number
}

export type ChordTransitionExercise = ExerciseBase & {
  kind: "chordTransition"
  chordA: string
  chordB: string
  mode: "one-minute" | "change-on-click"
  voicing: "open" | "barre" | "mixed"
}

export type EarTrainingExercise = ExerciseBase & {
  kind: "earTraining"
  category: "note" | "interval" | "scale-degree" | "chord-quality"
  root: NoteName
  questionCount: number
}

export type RhythmExercise = ExerciseBase & {
  kind: "rhythm"
  pattern: "quarters" | "eighths" | "triplets" | "sixteenths" | "syncopation"
  bpm: number
  bars: number
  beatsPerBar: number
}

export type PositionConnectionExercise = ExerciseBase & {
  kind: "positionConnection"
  root: NoteName
  scaleId: string
  fromPosition: number
  toPosition: number
}

export type ConstructionExercise = ExerciseBase & {
  kind: "construction"
  category: "interval" | "triad" | "seventh" | "inversion"
  root: NoteName
  questionCount: number
}

export type ExerciseDefinition =
  | FretboardRecallExercise
  | TempoLadderExercise
  | TechniqueExercise
  | ChordTransitionExercise
  | EarTrainingExercise
  | RhythmExercise
  | PositionConnectionExercise
  | ConstructionExercise

export type RoutineBlock = {
  id: string
  exercise: ExerciseDefinition
  durationMinutes: number
}

export type RoutineDefinition = {
  id: string
  name: string
  description: string
  durationMinutes: 10 | 20 | 30
  blocks: RoutineBlock[]
}

export type PracticeTarget = {
  skill: ExerciseKind
  key: string
  string?: number
  fret?: number
  note?: NoteName
  interval?: IntervalName
}

export type PracticeAttempt = {
  id: string
  prompt: string
  answer: string
  expected: string
  correct: boolean
  responseMs: number
  createdAt: string
  verification: VerificationKind
  target: PracticeTarget
  timingOffsetMs?: number
  bpm?: number
}

export type PracticeSession = {
  id: string
  exercise: ExerciseDefinition
  routineId?: string
  challenge?: SessionChallenge
  status: SessionStatus
  startedAt: string
  updatedAt: string
  completedAt?: string
  elapsedMs: number
  attempts: PracticeAttempt[]
}

export type SessionSummary = {
  sessionId: string
  exerciseKind: ExerciseKind
  durationMs: number
  attemptCount: number
  correctCount: number
  accuracy: number
  averageResponseMs: number | null
  averageTimingOffsetMs: number | null
  timingVariabilityMs: number | null
  bestBpm: number | null
  comfortableBpm: number | null
  completion: "completed" | "abandoned"
}

export type SkillRating = {
  skill: ExerciseKind
  targetKey: string
  attempts: number
  accuracy: number
  averageResponseMs: number | null
  strength: number
  lastPracticedAt: string
}

export type PersonalBest = {
  exerciseId: string
  exerciseName: string
  metric: "accuracy" | "bpm" | "clean-changes" | "timing"
  value: number
  achievedAt: string
  verification: VerificationKind
}

export type MilestoneProgress = {
  id: string
  title: string
  description: string
  skill?: ExerciseKind
  current: number
  target: number
  unit: "count" | "percent" | "bpm" | "milliseconds"
  earned: boolean
  verifiedOnly: boolean
}

export type PracticeDocument = {
  version: typeof PRACTICE_SCHEMA_VERSION
  savedExercises: ExerciseDefinition[]
  routines: RoutineDefinition[]
  sessions: PracticeSession[]
  activeSessionId?: string
  dailyChallengeState: DailyChallengeState
  acknowledgedMilestoneIds: string[]
}
