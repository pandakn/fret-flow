"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  createEmptyPracticeDocument,
  exportPracticeDocument,
  importPracticeDocument,
  PRACTICE_STORAGE_KEY,
  serializePracticeDocument,
  readPracticeStorage,
  clonePracticeExercise,
} from "@/lib/practice/storage"
import type {
  ExerciseDefinition,
  PracticeAttempt,
  PracticeSession,
  PracticeDocument,
  RoutineDefinition,
  SessionChallenge,
} from "@/types/practice"
import { normalizeDailyChallengeState } from "@/lib/practice/challenges"
import { getExerciseSkillIds } from "@/lib/learning/exercise-skills"
import {
  createScaleRouteProgress,
  reduceRouteAction,
} from "@/lib/practice/scale-route"
import type { ScaleRouteAction } from "@/types/note-routes"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { routeText } from "@/lib/i18n/note-routes"
import {
  PracticeStoreContext,
  type PracticeStore,
} from "./hooks/usePracticeStore"

const EMPTY_DOCUMENT = createEmptyPracticeDocument()

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const [document, setDocument] = useState(EMPTY_DOCUMENT)
  const [hydrated, setHydrated] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const { locale } = useI18n()
  const setValue = useCallback<
    React.Dispatch<React.SetStateAction<PracticeDocument>>
  >(
    (next) => {
      if (!hydrated || storageError) return
      setDocument(next)
    },
    [hydrated, storageError]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const loaded = readPracticeStorage(window.localStorage)
        setDocument(loaded)
        setStorageError(null)
        setHydrated(true)
      } catch (error) {
        setStorageError(
          error instanceof Error
            ? error.message
            : "Practice data could not be loaded."
        )
        setHydrated(true)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hydrated || storageError) return
    let timer: number | undefined
    try {
      window.localStorage.setItem(
        PRACTICE_STORAGE_KEY,
        serializePracticeDocument(document)
      )
    } catch {
      timer = window.setTimeout(
        () =>
          setStorageError(
            "Practice data could not be saved. Existing data remains unchanged."
          ),
        0
      )
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [document, hydrated, storageError])

  const startSession = useCallback(
    (
      exercise: ExerciseDefinition,
      routineId?: string,
      challenge?: SessionChallenge
    ) => {
      const now = new Date().toISOString()
      const sessionExercise = clonePracticeExercise(exercise)
      const session: PracticeSession = {
        id: createId(),
        exercise: {
          ...sessionExercise,
          skillIds: getExerciseSkillIds(sessionExercise),
        },
        learning: exercise.learning,
        routineId,
        challenge,
        status: "running",
        startedAt: now,
        updatedAt: now,
        elapsedMs: 0,
        attempts: [],
        route:
          sessionExercise.kind === "scaleRoute"
            ? createScaleRouteProgress(sessionExercise)
            : undefined,
      }
      setValue((current) => ({
        ...current,
        sessions: [...current.sessions, session],
        activeSessionId: session.id,
      }))
      return session
    },
    [setValue]
  )

  const dispatchRouteAction = useCallback(
    (sessionId: string, action: ScaleRouteAction) => {
      setValue((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sessionId
            ? reduceRouteAction(session, action)
            : session
        ),
      }))
    },
    [setValue]
  )

  const addAttempt = useCallback(
    (sessionId: string, attempt: PracticeAttempt) => {
      setValue((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                attempts: [...session.attempts, attempt],
                updatedAt: attempt.createdAt,
              }
            : session
        ),
      }))
    },
    [setValue]
  )

  const recordApplication = useCallback(
    (sessionId: string, status: "tried" | "skipped") => {
      const recordedAt = new Date().toISOString()
      setValue((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sessionId
            ? { ...session, application: { status, recordedAt } }
            : session
        ),
      }))
    },
    [setValue]
  )

  const setSessionStatus = useCallback(
    (
      sessionId: string,
      status: PracticeSession["status"],
      elapsedMs?: number
    ) => {
      const now = new Date().toISOString()
      setValue((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status,
                elapsedMs: elapsedMs ?? session.elapsedMs,
                updatedAt: now,
              }
            : session
        ),
      }))
    },
    [setValue]
  )

  const finishSession = useCallback(
    (
      sessionId: string,
      status: "completed" | "abandoned",
      elapsedMs: number
    ) => {
      const now = new Date().toISOString()
      setValue((current) => ({
        ...current,
        activeSessionId:
          current.activeSessionId === sessionId
            ? undefined
            : current.activeSessionId,
        sessions: current.sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status,
                elapsedMs: Math.max(session.elapsedMs, elapsedMs),
                updatedAt: now,
                completedAt: now,
              }
            : session
        ),
      }))
    },
    [setValue]
  )

  const saveExercise = useCallback(
    (exercise: ExerciseDefinition) => {
      setValue((current) => ({
        ...current,
        savedExercises: [
          ...current.savedExercises.filter((item) => item.id !== exercise.id),
          {
            ...clonePracticeExercise(exercise),
            skillIds: getExerciseSkillIds(exercise),
          },
        ],
      }))
    },
    [setValue]
  )

  const removeExercise = useCallback(
    (exerciseId: string) => {
      setValue((current) => ({
        ...current,
        savedExercises: current.savedExercises.filter(
          (exercise) => exercise.id !== exerciseId
        ),
      }))
    },
    [setValue]
  )

  const saveRoutine = useCallback(
    (routine: RoutineDefinition) => {
      setValue((current) => ({
        ...current,
        routines: [
          ...current.routines.filter((item) => item.id !== routine.id),
          {
            ...routine,
            blocks: routine.blocks.map((block) => ({
              ...block,
              exercise: {
                ...clonePracticeExercise(block.exercise),
                skillIds: getExerciseSkillIds(block.exercise),
              },
            })),
          },
        ],
      }))
    },
    [setValue]
  )

  const rerollWildcard = useCallback(
    (dayKey: string) => {
      setValue((current) => {
        const daily = normalizeDailyChallengeState(
          current.dailyChallengeState,
          dayKey
        )
        if (daily.wildcardRerolls >= 1) return current
        return {
          ...current,
          dailyChallengeState: {
            ...daily,
            wildcardRerolls: daily.wildcardRerolls + 1,
            wildcardSeed: daily.wildcardSeed + 1,
          },
        }
      })
    },
    [setValue]
  )

  const acknowledgeMilestone = useCallback(
    (milestoneId: string) => {
      setValue((current) =>
        current.acknowledgedMilestoneIds.includes(milestoneId)
          ? current
          : {
              ...current,
              acknowledgedMilestoneIds: [
                ...current.acknowledgedMilestoneIds,
                milestoneId,
              ],
            }
      )
    },
    [setValue]
  )

  const importData = useCallback((raw: string) => {
    try {
      const imported = importPracticeDocument(raw)
      if (!imported) return false
      window.localStorage.setItem(
        PRACTICE_STORAGE_KEY,
        serializePracticeDocument(imported)
      )
      setDocument(imported)
      setStorageError(null)
      return true
    } catch {
      return false
    }
  }, [])

  const exportData = useCallback(
    () =>
      storageError && typeof window !== "undefined"
        ? (window.localStorage.getItem(PRACTICE_STORAGE_KEY) ??
          window.localStorage.getItem("fret-flow.practice.v1") ??
          exportPracticeDocument(document))
        : exportPracticeDocument(document),
    [document, storageError]
  )

  const store = useMemo<PracticeStore>(
    () => ({
      document,
      hydrated,
      storageError,
      startSession,
      dispatchRouteAction,
      addAttempt,
      recordApplication,
      setSessionStatus,
      completeSession: (sessionId, elapsedMs) =>
        finishSession(sessionId, "completed", elapsedMs),
      abandonSession: (sessionId, elapsedMs) =>
        finishSession(sessionId, "abandoned", elapsedMs),
      saveExercise,
      removeExercise,
      saveRoutine,
      rerollWildcard,
      acknowledgeMilestone,
      importData,
      exportData,
    }),
    [
      addAttempt,
      dispatchRouteAction,
      recordApplication,
      document,
      exportData,
      finishSession,
      hydrated,
      storageError,
      importData,
      removeExercise,
      rerollWildcard,
      saveExercise,
      saveRoutine,
      acknowledgeMilestone,
      setSessionStatus,
      startSession,
    ]
  )

  return (
    <PracticeStoreContext.Provider value={store}>
      {storageError ? (
        <p
          role="alert"
          className="fixed inset-x-0 top-0 z-50 border-b border-destructive bg-background px-4 py-3 text-sm shadow-sm"
        >
          {routeText(locale, "storageIssue")}
        </p>
      ) : null}
      {children}
    </PracticeStoreContext.Provider>
  )
}
