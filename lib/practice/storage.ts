import {
  PRACTICE_SCHEMA_VERSION,
  type PracticeDocument,
  type PracticeSession,
  type ExerciseDefinition,
} from "@/types/practice"
import { createDailyChallengeState } from "./challenges"
import { CHROMATIC } from "@/lib/notes"
import {
  getRouteQuestionId,
  validateScaleRouteSnapshot,
} from "@/lib/note-routes"
import type {
  RouteCoordinate,
  RouteSubmission,
  ScaleRouteProgress,
  ScaleRouteSnapshot,
} from "@/types/note-routes"

export const PRACTICE_STORAGE_KEY = "fret-flow.practice.v2"
export const LEGACY_PRACTICE_STORAGE_KEY = "fret-flow.practice.v1"

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

const isExercise = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) &&
  typeof value.kind === "string" &&
  [
    "fretboardRecall",
    "tempoLadder",
    "technique",
    "chordTransition",
    "earTraining",
    "rhythm",
    "positionConnection",
    "construction",
    "scaleRoute",
  ].includes(value.kind) &&
  (value.kind !== "scaleRoute" || isScaleRouteExercise(value)) &&
  hasValidPathMetadata(value) &&
  isLearning(value.learning) &&
  (value.assessmentQuestionIds === undefined ||
    (Array.isArray(value.assessmentQuestionIds) &&
      value.assessmentQuestionIds.every((id) => typeof id === "string"))) &&
  (value.skillIds === undefined ||
    (Array.isArray(value.skillIds) &&
      value.skillIds.every((id) => typeof id === "string")))

const isScaleRouteSnapshot = (value: unknown): value is ScaleRouteSnapshot =>
  validateScaleRouteSnapshot(value)
const isRouteQuestionScope = (
  snapshot: ScaleRouteSnapshot,
  ids: unknown
): ids is string[] => {
  if (ids === undefined) return true
  if (
    !Array.isArray(ids) ||
    !ids.every((id) => typeof id === "string") ||
    new Set(ids).size !== ids.length
  )
    return false
  const known = new Set(
    snapshot.transitions.map((transition) =>
      getRouteQuestionId(snapshot, transition.id)
    )
  )
  return ids.every((id) => known.has(id))
}
const isScaleRouteExercise = (value: Record<string, unknown>) =>
  isScaleRouteSnapshot(value.snapshot) &&
  isRouteQuestionScope(value.snapshot, value.assessmentQuestionIds)
const isCoordinate = (value: unknown): value is RouteCoordinate =>
  isRecord(value) &&
  Number.isInteger(value.string) &&
  Number(value.string) >= 0 &&
  Number(value.string) < 6 &&
  Number.isInteger(value.fret) &&
  Number(value.fret) >= 0 &&
  Number(value.fret) <= 21
const isRouteProgress = (
  value: unknown,
  snapshot: ScaleRouteSnapshot
): value is ScaleRouteProgress => {
  if (
    !isRecord(value) ||
    !["check", "guitar", "finished"].includes(String(value.phase)) ||
    !Array.isArray(value.questionIds) ||
    !isRouteQuestionScope(snapshot, value.questionIds) ||
    !Array.isArray(value.processedCommandIds) ||
    value.processedCommandIds.length > 128 ||
    !value.processedCommandIds.every((id) => typeof id === "string") ||
    !Number.isInteger(value.questionIndex) ||
    Number(value.questionIndex) < 0 ||
    !Number.isInteger(value.submissionOrdinal) ||
    Number(value.submissionOrdinal) < 1 ||
    typeof value.assisted !== "boolean" ||
    typeof value.answered !== "boolean" ||
    !(
      value.feedback === null ||
      [
        "exact",
        "same-pitch",
        "same-note",
        "scale-tone",
        "outside-scale",
      ].includes(String(value.feedback))
    )
  )
    return false
  if (
    value.phase === "check" &&
    Number(value.questionIndex) >= value.questionIds.length
  )
    return false
  if (
    value.phase !== "check" &&
    value.questionIds.length > 0 &&
    Number(value.questionIndex) >= value.questionIds.length
  )
    return false
  if (value.answered !== (value.feedback === "exact")) return false
  if (
    value.processedCommandIds.length !== new Set(value.processedCommandIds).size
  )
    return false
  return true
}
const isRouteAttempt = (
  value: unknown,
  snapshot: ScaleRouteSnapshot,
  routeIds: readonly string[]
): value is Record<string, unknown> & { route: RouteSubmission } => {
  if (!isRecord(value) || !isRecord(value.route)) return false
  const route = value.route
  if (
    typeof route.questionId !== "string" ||
    !routeIds.includes(route.questionId) ||
    typeof route.transitionId !== "string" ||
    !Number.isInteger(route.submissionOrdinal) ||
    Number(route.submissionOrdinal) < 1 ||
    typeof route.occurrenceId !== "string" ||
    !isCoordinate(route.selected) ||
    !isCoordinate(route.expected) ||
    typeof route.assisted !== "boolean"
  )
    return false
  const transition = snapshot.transitions.find(
    (item) => item.id === route.transitionId
  )
  const occurrence = snapshot.occurrences.find(
    (item) => item.id === route.occurrenceId
  )
  if (
    !transition ||
    !occurrence ||
    route.questionId !== getRouteQuestionId(snapshot, transition.id) ||
    transition.toId !== occurrence.id ||
    route.expected.string !== occurrence.string ||
    route.expected.fret !== occurrence.fret ||
    value.correct !==
      (route.selected.string === route.expected.string &&
        route.selected.fret === route.expected.fret) ||
    value.target === undefined ||
    !isRecord(value.target) ||
    value.target.skill !== "scaleRoute" ||
    value.target.key !== route.questionId ||
    value.target.string !== occurrence.string ||
    value.target.fret !== occurrence.fret ||
    value.target.note !== occurrence.note ||
    value.skillId !== "scale.route" ||
    value.verification !== "app-verified" ||
    value.responseMs !== 0 ||
    value.bpm !== undefined ||
    value.timingOffsetMs !== undefined ||
    typeof value.createdAt !== "string" ||
    typeof value.id !== "string"
  )
    return false
  return true
}

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

const hasValidSessionRoute = (
  exercise: Record<string, unknown>,
  route: unknown,
  attempts: unknown[]
) => {
  if (exercise.kind !== "scaleRoute") return route === undefined
  if (
    !isScaleRouteSnapshot(exercise.snapshot) ||
    !isRouteProgress(route, exercise.snapshot)
  )
    return false
  const questionIds = route.questionIds
  return attempts.every((attempt) =>
    isRouteAttempt(
      attempt,
      exercise.snapshot as ScaleRouteSnapshot,
      questionIds
    )
  )
}

const isSession = (value: unknown): value is PracticeSession =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.startedAt === "string" &&
  typeof value.updatedAt === "string" &&
  typeof value.elapsedMs === "number" &&
  Array.isArray(value.attempts) &&
  isExercise(value.exercise) &&
  isLearning(value.learning) &&
  hasValidSessionRoute(value.exercise, value.route, value.attempts) &&
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
    value.version === 4 &&
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

export const clonePracticeExercise = <T extends ExerciseDefinition>(
  exercise: T
): T => JSON.parse(JSON.stringify(exercise)) as T

export type PracticeStorage = Pick<Storage, "getItem" | "setItem">

export const readPracticeStorage = (
  storage: PracticeStorage
): PracticeDocument => {
  const currentRaw = storage.getItem(PRACTICE_STORAGE_KEY)
  if (currentRaw !== null) {
    let parsed: unknown
    try {
      parsed = JSON.parse(currentRaw)
    } catch {
      throw new Error(
        "Practice history is corrupt. Your saved data is preserved; export or recover it before writing."
      )
    }
    const current = validatePracticeDocument(parsed)
    if (!current)
      throw new Error(
        "Practice history uses an unsupported version or contains invalid data. Your saved data is preserved."
      )
    return current
  }

  const legacyRaw = storage.getItem(LEGACY_PRACTICE_STORAGE_KEY)
  if (!legacyRaw) {
    const empty = createEmptyPracticeDocument()
    storage.setItem(PRACTICE_STORAGE_KEY, serializePracticeDocument(empty))
    return empty
  }

  let imported: PracticeDocument | null = null
  try {
    imported = validatePracticeDocument(JSON.parse(legacyRaw))
  } catch {
    /* Preserve unreadable legacy bytes and expose an empty import only after validation. */
  }
  if (!imported)
    throw new Error(
      "Legacy practice history could not be imported. The original data remains preserved."
    )
  const snapshot = JSON.parse(JSON.stringify(imported)) as PracticeDocument
  storage.setItem(PRACTICE_STORAGE_KEY, serializePracticeDocument(snapshot))
  return snapshot
}
