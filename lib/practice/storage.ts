import {
  PRACTICE_SCHEMA_VERSION,
  type PracticeDocument,
  type PracticeSession,
} from "@/types/practice"

export const PRACTICE_STORAGE_KEY = "fret-flow.practice.v1"

export const createEmptyPracticeDocument = (): PracticeDocument => ({
  version: PRACTICE_SCHEMA_VERSION,
  savedExercises: [],
  routines: [],
  sessions: [],
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
      !value.sessions.every(isSession)
    ) {
      return null
    }
    return value as PracticeDocument
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
    return validatePracticeDocument(JSON.parse(raw)) ?? createEmptyPracticeDocument()
  } catch {
    return createEmptyPracticeDocument()
  }
}

export const serializePracticeDocument = (
  document: PracticeDocument
): string => JSON.stringify(document)

export const exportPracticeDocument = (
  document: PracticeDocument
): string => JSON.stringify(document, null, 2)

export const importPracticeDocument = (raw: string): PracticeDocument | null =>
  validatePracticeDocument(JSON.parse(raw) as unknown)
