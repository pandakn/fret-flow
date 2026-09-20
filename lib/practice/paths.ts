import { CHROMATIC, getNoteAtFret } from "@/lib/notes"
import { getTuningById } from "@/lib/tunings"
import type { IntervalName, NoteName } from "@/types/music"
import type {
  FretboardPathStageId,
  FretboardRecallExercise,
  PracticeSession,
} from "@/types/practice"
import type { RecallPromptTarget } from "./exercises"
import { buildReviewQueue, getDuePathTargetCount } from "./review"

export type FretboardPathTarget = RecallPromptTarget

export type FretboardPathStage = {
  id: FretboardPathStageId
  order: number
  name: string
  shortName: string
  description: string
  why: string
  thresholds: {
    accuracy: number
    coverage: number
    medianResponseMs: number
    sessions: number
  }
  questionCount: number
  targets: FretboardPathTarget[]
}

export type StageEvidence = {
  stageId: FretboardPathStageId
  eligibleAttempts: number
  sessionCount: number
  checkpointCompleted: boolean
  accuracy: number
  coverage: number
  medianResponseMs: number | null
  masteredTargetIds: string[]
  shakyTargetIds: string[]
  reviewTargetIds: string[]
  passed: boolean
}

export type FretboardPathProgress = {
  stages: {
    stage: FretboardPathStage
    evidence: StageEvidence
    earned: boolean
  }[]
  currentStage: FretboardPathStage
  currentEvidence: StageEvidence
  earnedStageIds: FretboardPathStageId[]
  complete: boolean
  dueReviewCount: number
}

const NATURAL_NOTES = new Set<NoteName>(["A", "B", "C", "D", "E", "F", "G"])
const LANDMARK_FRETS = [0, 3, 5, 7, 9, 12]
const INTERVALS: { interval: IntervalName; semitones: number }[] = [
  { interval: "R", semitones: 0 },
  { interval: "2", semitones: 2 },
  { interval: "3", semitones: 4 },
  { interval: "4", semitones: 5 },
  { interval: "5", semitones: 7 },
  { interval: "6", semitones: 9 },
  { interval: "7", semitones: 11 },
]

const standardTuning = () => {
  const tuning = getTuningById("standard")
  if (!tuning) throw new Error("Fretboard path requires standard tuning")
  return tuning.strings
}

const coordinateTarget = (
  stageId: FretboardPathStageId,
  string: number,
  fret: number
): FretboardPathTarget => ({
  id: `path:fretboard:${stageId}:position:${string}-${fret}`,
  direction: "namePosition",
  string,
  fret,
  note: getNoteAtFret(standardTuning()[string], fret),
})

const findTarget = (
  stageId: FretboardPathStageId,
  note: NoteName,
  string: number
): FretboardPathTarget => ({
  id: `path:fretboard:${stageId}:find:${note}:${string}`,
  direction: "findPosition",
  string,
  note,
})

const coordinateTargets = (
  stageId: FretboardPathStageId,
  frets: readonly number[],
  filter: (note: NoteName) => boolean = () => true
) =>
  Array.from({ length: 6 }, (_, string) =>
    frets
      .map((fret) => coordinateTarget(stageId, string, fret))
      .filter((target) => filter(target.note))
  ).flat()

const noteOnStringTargets = (
  stageId: FretboardPathStageId,
  notes: readonly NoteName[]
) =>
  Array.from({ length: 6 }, (_, string) =>
    notes.map((note) => findTarget(stageId, note, string))
  ).flat()

const intervalTargets = (): FretboardPathTarget[] =>
  (["C", "G", "D", "A"] as const).flatMap((root, rootIndex) =>
    INTERVALS.map(({ interval, semitones }, intervalIndex) => ({
      id: `path:fretboard:interval-map:${root}:${interval}`,
      direction: "findPosition" as const,
      root,
      interval,
      note: CHROMATIC[(CHROMATIC.indexOf(root) + semitones) % 12],
      string: (rootIndex + intervalIndex) % 6,
    }))
  )

const allFrets = Array.from({ length: 13 }, (_, fret) => fret)
const naturalNotes = CHROMATIC.filter((note) => NATURAL_NOTES.has(note))

export const FRETBOARD_PATH_STAGES: FretboardPathStage[] = [
  {
    id: "landmarks",
    order: 1,
    name: "Landmark notes",
    shortName: "Landmarks",
    description: "Name open strings and the main fret markers without hints.",
    why: "Landmarks give you fast reference points for every later shape and interval.",
    thresholds: {
      accuracy: 0.8,
      coverage: 0.8,
      medianResponseMs: 5_000,
      sessions: 2,
    },
    questionCount: 18,
    targets: coordinateTargets("landmarks", LANDMARK_FRETS),
  },
  {
    id: "natural-map",
    order: 2,
    name: "Natural-note map",
    shortName: "Natural map",
    description: "Recall natural notes in both directions across frets 0–12.",
    why: "Natural notes turn the neck into a readable map instead of a set of boxes.",
    thresholds: {
      accuracy: 0.85,
      coverage: 0.8,
      medianResponseMs: 5_000,
      sessions: 2,
    },
    questionCount: 20,
    targets: [
      ...coordinateTargets("natural-map", allFrets, (note) =>
        NATURAL_NOTES.has(note)
      ),
      ...noteOnStringTargets("natural-map", naturalNotes),
    ],
  },
  {
    id: "chromatic-map",
    order: 3,
    name: "Chromatic map",
    shortName: "Chromatic map",
    description: "Add sharps and recall every note class across frets 0–12.",
    why: "Chromatic fluency removes hesitation when keys and positions change.",
    thresholds: {
      accuracy: 0.85,
      coverage: 0.75,
      medianResponseMs: 4_500,
      sessions: 3,
    },
    questionCount: 24,
    targets: [
      ...coordinateTargets("chromatic-map", allFrets),
      ...noteOnStringTargets("chromatic-map", CHROMATIC),
    ],
  },
  {
    id: "interval-map",
    order: 4,
    name: "Interval map",
    shortName: "Intervals",
    description: "Find scale intervals from rotating roots across the neck.",
    why: "Intervals connect fretboard recall to chords, scales, and improvisation.",
    thresholds: {
      accuracy: 0.85,
      coverage: 0.8,
      medianResponseMs: 4_500,
      sessions: 2,
    },
    questionCount: 18,
    targets: intervalTargets(),
  },
  {
    id: "position-links",
    order: 5,
    name: "Position links",
    shortName: "Position links",
    description:
      "Recall notes at the boundaries between adjacent playing areas.",
    why: "Boundary notes help you leave familiar boxes without losing your place.",
    thresholds: {
      accuracy: 0.85,
      coverage: 0.8,
      medianResponseMs: 4_000,
      sessions: 2,
    },
    questionCount: 18,
    targets: coordinateTargets("position-links", [4, 5, 7, 8, 9, 12]),
  },
]

export const getFretboardPathStage = (stageId: FretboardPathStageId) => {
  const stage = FRETBOARD_PATH_STAGES.find((item) => item.id === stageId)
  if (!stage) throw new Error(`Unknown fretboard path stage: ${stageId}`)
  return stage
}

export const getFretboardPathTarget = (
  stageId: FretboardPathStageId,
  targetId: string
) =>
  getFretboardPathStage(stageId).targets.find(
    (target) => target.id === targetId
  )

const median = (values: number[]) => {
  if (values.length === 0) return null
  const sorted = values.toSorted((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

export const evaluateFretboardStage = (
  stage: FretboardPathStage,
  sessions: readonly PracticeSession[]
): StageEvidence => {
  const targetIds = new Set(stage.targets.map((target) => target.id))
  const matchingSessions = sessions.filter(
    (session) =>
      session.status === "completed" &&
      session.exercise.kind === "fretboardRecall" &&
      session.exercise.path?.pathId === "fretboard" &&
      session.exercise.path.stageId === stage.id
  )
  const attempts = matchingSessions.flatMap((session) =>
    session.attempts.filter(
      (attempt) =>
        attempt.verification === "app-verified" &&
        targetIds.has(attempt.target.key) &&
        attempt.target.string !== undefined
    )
  )
  const attemptedIds = new Set(attempts.map((attempt) => attempt.target.key))
  const byTarget = new Map<string, typeof attempts>()
  for (const attempt of attempts) {
    const current = byTarget.get(attempt.target.key) ?? []
    current.push(attempt)
    byTarget.set(attempt.target.key, current)
  }
  const masteredTargetIds: string[] = []
  const shakyTargetIds: string[] = []
  const reviewTargetIds: string[] = []

  for (const target of stage.targets) {
    const targetAttempts = byTarget.get(target.id) ?? []
    if (targetAttempts.length === 0) {
      reviewTargetIds.push(target.id)
      continue
    }
    const accuracy =
      targetAttempts.filter((attempt) => attempt.correct).length /
      targetAttempts.length
    const averageResponse =
      targetAttempts.reduce((sum, attempt) => sum + attempt.responseMs, 0) /
      targetAttempts.length
    if (
      accuracy >= stage.thresholds.accuracy &&
      averageResponse <= stage.thresholds.medianResponseMs
    ) {
      masteredTargetIds.push(target.id)
    } else {
      shakyTargetIds.push(target.id)
    }
  }

  const accuracy =
    attempts.length === 0
      ? 0
      : attempts.filter((attempt) => attempt.correct).length / attempts.length
  const coverage = attemptedIds.size / stage.targets.length
  const medianResponseMs = median(attempts.map((attempt) => attempt.responseMs))
  const checkpointCompleted = matchingSessions.some(
    (session) =>
      session.exercise.kind === "fretboardRecall" &&
      session.exercise.path?.checkpoint &&
      session.attempts.length > 0
  )
  const sessionCount = matchingSessions.filter((session) =>
    session.attempts.some((attempt) => targetIds.has(attempt.target.key))
  ).length
  const passed =
    sessionCount >= stage.thresholds.sessions &&
    checkpointCompleted &&
    accuracy >= stage.thresholds.accuracy &&
    coverage >= stage.thresholds.coverage &&
    medianResponseMs !== null &&
    medianResponseMs <= stage.thresholds.medianResponseMs

  return {
    stageId: stage.id,
    eligibleAttempts: attempts.length,
    sessionCount,
    checkpointCompleted,
    accuracy,
    coverage,
    medianResponseMs,
    masteredTargetIds,
    shakyTargetIds,
    reviewTargetIds,
    passed,
  }
}

export const hasFretboardStageBeenEarned = (
  stage: FretboardPathStage,
  sessions: readonly PracticeSession[]
): boolean => {
  const matching = sessions
    .filter(
      (session) =>
        session.status === "completed" &&
        session.exercise.kind === "fretboardRecall" &&
        session.exercise.path?.pathId === "fretboard" &&
        session.exercise.path.stageId === stage.id
    )
    .toSorted((left, right) => left.updatedAt.localeCompare(right.updatedAt))
  const history: PracticeSession[] = []
  for (const session of matching) {
    history.push(session)
    if (evaluateFretboardStage(stage, history).passed) return true
  }
  return false
}

export const getFretboardPathProgress = (
  sessions: readonly PracticeSession[],
  now = new Date()
): FretboardPathProgress => {
  let previousEarned = true
  const stages = FRETBOARD_PATH_STAGES.map((stage) => {
    const evidence = evaluateFretboardStage(stage, sessions)
    const earned =
      previousEarned && hasFretboardStageBeenEarned(stage, sessions)
    previousEarned = earned
    return { stage, evidence, earned }
  })
  const current = stages.find((item) => !item.earned) ?? stages.at(-1)
  if (!current) throw new Error("Fretboard path requires at least one stage")
  return {
    stages,
    currentStage: current.stage,
    currentEvidence: current.evidence,
    earnedStageIds: stages
      .filter((item) => item.earned)
      .map((item) => item.stage.id),
    complete: stages.every((item) => item.earned),
    dueReviewCount: getDuePathTargetCount(
      current.stage.targets,
      sessions,
      now,
      current.stage.thresholds.medianResponseMs
    ),
  }
}

const hashSeed = (value: string) => {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

export const createFretboardPathExercise = ({
  stageId,
  sessions,
  checkpoint = false,
  now = new Date(),
}: {
  stageId: FretboardPathStageId
  sessions: readonly PracticeSession[]
  checkpoint?: boolean
  now?: Date
}): FretboardRecallExercise => {
  const stage = getFretboardPathStage(stageId)
  const count = Math.min(stage.questionCount, stage.targets.length)
  const seed = hashSeed(
    `${stageId}:${checkpoint}:${sessions.length}:${now.toISOString().slice(0, 10)}`
  )
  const queue = buildReviewQueue(stage.targets, sessions, {
    count,
    seed,
    now,
    slowResponseMs: stage.thresholds.medianResponseMs,
  })

  return {
    id: `fretboard-path-${stageId}-${checkpoint ? "check" : "review"}-${now.getTime()}`,
    kind: "fretboardRecall",
    name: checkpoint
      ? `${stage.shortName} checkpoint`
      : `${stage.shortName} review`,
    description: checkpoint
      ? `Check your ${stage.name.toLowerCase()} across the full stage.`
      : stage.description,
    durationMinutes: checkpoint ? 8 : 6,
    createdAt: now.toISOString(),
    recall: stageId === "interval-map" ? "interval" : "note",
    promptDirection: "mixed",
    root: "C",
    strings: [0, 1, 2, 3, 4, 5],
    fretRange: { min: 0, max: 12 },
    questionCount: queue.length,
    path: {
      pathId: "fretboard",
      stageId,
      checkpoint,
      targetIds: queue.map((target) => target.id),
    },
  }
}
