"use client"

import { useCallback, useMemo } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import {
  createEmptyPracticeDocument,
  exportPracticeDocument,
  importPracticeDocument,
  parsePracticeDocument,
  PRACTICE_STORAGE_KEY,
  serializePracticeDocument,
} from "@/lib/practice/storage"
import type {
  ExerciseDefinition,
  PracticeAttempt,
  PracticeSession,
  RoutineDefinition,
} from "@/types/practice"
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
  const { value: document, setValue, hydrated } = useLocalStorage({
    key: PRACTICE_STORAGE_KEY,
    fallback: EMPTY_DOCUMENT,
    parse: parsePracticeDocument,
    serialize: serializePracticeDocument,
  })

  const startSession = useCallback(
    (exercise: ExerciseDefinition, routineId?: string) => {
      const now = new Date().toISOString()
      const session: PracticeSession = {
        id: createId(),
        exercise,
        routineId,
        status: "running",
        startedAt: now,
        updatedAt: now,
        elapsedMs: 0,
        attempts: [],
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
          exercise,
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
          routine,
        ],
      }))
    },
    [setValue]
  )

  const importData = useCallback(
    (raw: string) => {
      try {
        const imported = importPracticeDocument(raw)
        if (!imported) return false
        setValue(imported)
        return true
      } catch {
        return false
      }
    },
    [setValue]
  )

  const exportData = useCallback(
    () => exportPracticeDocument(document),
    [document]
  )

  const store = useMemo<PracticeStore>(
    () => ({
      document,
      hydrated,
      startSession,
      addAttempt,
      setSessionStatus,
      completeSession: (sessionId, elapsedMs) =>
        finishSession(sessionId, "completed", elapsedMs),
      abandonSession: (sessionId, elapsedMs) =>
        finishSession(sessionId, "abandoned", elapsedMs),
      saveExercise,
      removeExercise,
      saveRoutine,
      importData,
      exportData,
    }),
    [
      addAttempt,
      document,
      exportData,
      finishSession,
      hydrated,
      importData,
      removeExercise,
      saveExercise,
      saveRoutine,
      setSessionStatus,
      startSession,
    ]
  )

  return (
    <PracticeStoreContext.Provider value={store}>
      {children}
    </PracticeStoreContext.Provider>
  )
}
