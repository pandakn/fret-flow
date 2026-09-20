"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  ExerciseDefinition,
  PracticeAttempt,
  SessionChallenge,
} from "@/types/practice"
import { usePracticeStore } from "./usePracticeStore"

export function usePracticeSession(
  exercise: ExerciseDefinition,
  challenge?: SessionChallenge
) {
  const store = usePracticeStore()
  const [sessionId, setSessionId] = useState<string>()
  const [elapsedMs, setElapsedMs] = useState(0)
  const runningSinceRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)

  const session = store.document.sessions.find((item) => item.id === sessionId)
  const running = session?.status === "running"

  const getElapsed = useCallback(() => {
    if (runningSinceRef.current === null) return accumulatedRef.current
    return accumulatedRef.current + performance.now() - runningSinceRef.current
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setElapsedMs(getElapsed()), 250)
    return () => window.clearInterval(timer)
  }, [getElapsed, running])

  const start = useCallback(
    (routineId?: string) => {
      const next = store.startSession(exercise, routineId, challenge)
      setSessionId(next.id)
      accumulatedRef.current = 0
      runningSinceRef.current = performance.now()
      setElapsedMs(0)
      return next
    },
    [challenge, exercise, store]
  )

  const pause = useCallback(() => {
    if (!sessionId) return
    accumulatedRef.current = getElapsed()
    runningSinceRef.current = null
    store.setSessionStatus(sessionId, "paused", accumulatedRef.current)
    setElapsedMs(accumulatedRef.current)
  }, [getElapsed, sessionId, store])

  const resume = useCallback(() => {
    if (!sessionId) return
    runningSinceRef.current = performance.now()
    store.setSessionStatus(sessionId, "running", accumulatedRef.current)
  }, [sessionId, store])

  const addAttempt = useCallback(
    (attempt: PracticeAttempt) => {
      if (sessionId) store.addAttempt(sessionId, attempt)
    },
    [sessionId, store]
  )

  const complete = useCallback(() => {
    if (!sessionId) return
    const finalElapsed = getElapsed()
    runningSinceRef.current = null
    accumulatedRef.current = finalElapsed
    store.completeSession(sessionId, finalElapsed)
    setElapsedMs(finalElapsed)
  }, [getElapsed, sessionId, store])

  const abandon = useCallback(() => {
    if (!sessionId) return
    const finalElapsed = getElapsed()
    runningSinceRef.current = null
    store.abandonSession(sessionId, finalElapsed)
    setElapsedMs(finalElapsed)
  }, [getElapsed, sessionId, store])

  return {
    session,
    elapsedMs,
    start,
    pause,
    resume,
    addAttempt,
    complete,
    abandon,
  }
}
