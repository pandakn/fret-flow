import {
  PRACTICE_SCHEMA_VERSION,
  type PracticeDocument,
  type PracticeSession,
} from "@/types/practice"
import { createDailyChallengeState } from "./challenges"

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

const isSession = (value: unknown): value is PracticeSession =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.startedAt === "string" &&
  typeof value.updatedAt === "string" &&
  typeof value.elapsedMs === "number" &&
  Array.isArray(value.attempts) &&
  isRecord(value.exercise) &&
  typeof value.exercise.kind === "string"

export const validatePracticeDocument = (
  value: unknown
): PracticeDocument | null => {
  if (!isRecord(value)) return null

  if (value.version === PRACTICE_SCHEMA_VERSION) {
    if (
      !Array.isArray(value.savedExercises) ||
      !Array.isArray(value.routines) ||
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
