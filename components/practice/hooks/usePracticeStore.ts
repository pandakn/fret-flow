"use client"

import { createContext, useContext } from "react"
import type {
  ExerciseDefinition,
  PracticeAttempt,
  PracticeDocument,
  PracticeSession,
  RoutineDefinition,
} from "@/types/practice"

export type PracticeStore = {
  document: PracticeDocument
  hydrated: boolean
  startSession: (exercise: ExerciseDefinition, routineId?: string) => PracticeSession
  addAttempt: (sessionId: string, attempt: PracticeAttempt) => void
  setSessionStatus: (
    sessionId: string,
    status: PracticeSession["status"],
    elapsedMs?: number
  ) => void
  completeSession: (sessionId: string, elapsedMs: number) => void
  abandonSession: (sessionId: string, elapsedMs: number) => void
  saveExercise: (exercise: ExerciseDefinition) => void
  removeExercise: (exerciseId: string) => void
  saveRoutine: (routine: RoutineDefinition) => void
  importData: (raw: string) => boolean
  exportData: () => string
}

export const PracticeStoreContext = createContext<PracticeStore | null>(null)

export function usePracticeStore(): PracticeStore {
  const store = useContext(PracticeStoreContext)
  if (!store) throw new Error("usePracticeStore must be used inside PracticeProvider")
  return store
}
