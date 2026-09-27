import {
  PRACTICE_SCHEMA_VERSION,
  type PracticeDocument,
  type PracticeSession,
} from "@/types/practice"
import { createDailyChallengeState } from "./challenges"
import { CHROMATIC } from "@/lib/notes"

export const PRACTICE_STORAGE_KEY = "fret-flow.practice.v1"

export const createEmptyPracticeDocument = (): PracticeDocument => ({
  version: PRACTICE_SCHEMA_VERSION,
  savedExercises: [],
  routines: [],
  sessions: [],
  dailyChallengeState: createDailyChallengeState(),
  acknowledgedMilestoneIds: [],
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const PATH_STAGE_IDS = new Set([
  "landmarks",
  "natural-map",
  "chromatic-map",
  "interval-map",
  "position-links",
])

const hasValidPathMetadata = (exercise: Record<string, unknown>) => {
  if (exercise.path === undefined) return true
  if (!isRecord(exercise.path)) return false
  return (
    exercise.path.pathId === "fretboard" &&
    typeof exercise.path.stageId === "string" &&
    PATH_STAGE_IDS.has(exercise.path.stageId) &&
    typeof exercise.path.checkpoint === "boolean" &&
    Array.isArray(exercise.path.targetIds) &&
    exercise.path.targetIds.every((targetId) => typeof targetId === "string")
  )
}

const isExercise = (value: unknown) =>
  isRecord(value) &&
  typeof value.kind === "string" &&
  hasValidPathMetadata(value) &&
  isLearning(value.learning) &&
  (value.skillIds === undefined ||
    (Array.isArray(value.skillIds) &&
      value.skillIds.every((id) => typeof id === "string")))

const isLearning = (value: unknown) => {
  if (value === undefined) return true
  if (!isRecord(value) || !isRecord(value.context)) return false
  return (
    typeof value.templateId === "string" &&
    typeof value.objectiveId === "string" &&
    Array.isArray(value.skillIds) &&
    value.skillIds.length > 0 &&
    value.skillIds.every((id) => typeof id === "string") &&
    ["quick-check", "guided-practice", "review"].includes(
      String(value.origin)
    ) &&
    CHROMATIC.includes(value.context.key as (typeof CHROMATIC)[number]) &&
    CHROMATIC.includes(value.context.root as (typeof CHROMATIC)[number]) &&
    (value.context.degree === undefined ||
      (Number.isInteger(value.context.degree) &&
        Number(value.context.degree) >= 1 &&
        Number(value.context.degree) <= 7))
  )
}

const isRoutine = (value: unknown) =>
  isRecord(value) &&
  Array.isArray(value.blocks) &&
  value.blocks.every((block) => isRecord(block) && isExercise(block.exercise))

const isSession = (value: unknown): value is PracticeSession =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.startedAt === "string" &&
  typeof value.updatedAt === "string" &&
  typeof value.elapsedMs === "number" &&
  Array.isArray(value.attempts) &&
  isExercise(value.exercise) &&
  isLearning(value.learning) &&
  (value.application === undefined ||
    (isRecord(value.application) &&
      (value.application.status === "tried" ||
        value.application.status === "skipped") &&
      typeof value.application.recordedAt === "string"))

export const validatePracticeDocument = (
  value: unknown
): PracticeDocument | null => {
  if (!isRecord(value)) return null

  if (value.version === PRACTICE_SCHEMA_VERSION) {
    if (
      !Array.isArray(value.savedExercises) ||
      !value.savedExercises.every(isExercise) ||
      !Array.isArray(value.routines) ||
      !value.routines.every(isRoutine) ||
      !Array.isArray(value.sessions) ||
      !value.sessions.every(isSession) ||
      !isRecord(value.dailyChallengeState) ||
      typeof value.dailyChallengeState.dayKey !== "string" ||
      typeof value.dailyChallengeState.wildcardRerolls !== "number" ||
      typeof value.dailyChallengeState.wildcardSeed !== "number" ||
      !Array.isArray(value.acknowledgedMilestoneIds) ||
      !value.acknowledgedMilestoneIds.every(
        (milestoneId) => typeof milestoneId === "string"
      )
    ) {
      return null
    }
    return value as PracticeDocument
  }

  if (
    value.version === 3 &&
    Array.isArray(value.savedExercises) &&
    value.savedExercises.every(isExercise) &&
    Array.isArray(value.routines) &&
    value.routines.every(isRoutine) &&
    Array.isArray(value.sessions) &&
    value.sessions.every(isSession) &&
    isRecord(value.dailyChallengeState) &&
    Array.isArray(value.acknowledgedMilestoneIds)
  ) {
    return {
      ...(value as Omit<PracticeDocument, "version">),
      version: PRACTICE_SCHEMA_VERSION,
    }
  }

  if (
    value.version === 2 &&
    Array.isArray(value.savedExercises) &&
    Array.isArray(value.routines) &&
    Array.isArray(value.sessions) &&
    value.sessions.every(isSession) &&
    isRecord(value.dailyChallengeState) &&
    Array.isArray(value.acknowledgedMilestoneIds)
  ) {
    return {
      version: PRACTICE_SCHEMA_VERSION,
      savedExercises:
        value.savedExercises as PracticeDocument["savedExercises"],
      routines: value.routines as PracticeDocument["routines"],
      sessions: value.sessions,
      activeSessionId:
        typeof value.activeSessionId === "string"
          ? value.activeSessionId
          : undefined,
      dailyChallengeState:
        value.dailyChallengeState as PracticeDocument["dailyChallengeState"],
      acknowledgedMilestoneIds: value.acknowledgedMilestoneIds.filter(
        (milestoneId): milestoneId is string => typeof milestoneId === "string"
      ),
    }
  }

  if (
    value.version === 1 &&
    Array.isArray(value.savedExercises) &&
    Array.isArray(value.routines) &&
    Array.isArray(value.sessions) &&
    value.sessions.every(isSession)
  ) {
    return {
      version: PRACTICE_SCHEMA_VERSION,
      savedExercises:
        value.savedExercises as PracticeDocument["savedExercises"],
      routines: value.routines as PracticeDocument["routines"],
      sessions: value.sessions,
      activeSessionId:
        typeof value.activeSessionId === "string"
          ? value.activeSessionId
          : undefined,
      dailyChallengeState: createDailyChallengeState(),
      acknowledgedMilestoneIds: [],
    }
  }

  if (value.version === 0 && Array.isArray(value.sessions)) {
    const sessions = value.sessions.filter(isSession)
    return {
      ...createEmptyPracticeDocument(),
      sessions,
    }
  }

  return null
}

export const parsePracticeDocument = (raw: string | null): PracticeDocument => {
  if (!raw) return createEmptyPracticeDocument()
  try {
    return (
      validatePracticeDocument(JSON.parse(raw)) ?? createEmptyPracticeDocument()
    )
  } catch {
    return createEmptyPracticeDocument()
  }
}

export const serializePracticeDocument = (document: PracticeDocument): string =>
  JSON.stringify(document)

export const exportPracticeDocument = (document: PracticeDocument): string =>
  JSON.stringify(document, null, 2)

export const importPracticeDocument = (raw: string): PracticeDocument | null =>
  validatePracticeDocument(JSON.parse(raw) as unknown)
