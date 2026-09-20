import type {
  ExerciseDefinition,
  PracticeSession,
  PracticeTarget,
} from "@/types/practice"
import { summarizeSession } from "./scoring"

export type DifficultyBand = 0 | 1 | 2

export const getWeakTargets = (
  sessions: readonly PracticeSession[],
  limit = 12
): PracticeTarget[] => {
  const scores = new Map<
    string,
    {
      target: PracticeTarget
      misses: number
      attempts: number
      responseMs: number
    }
  >()

  for (const session of sessions) {
    for (const attempt of session.attempts) {
      const current = scores.get(attempt.target.key) ?? {
        target: attempt.target,
        misses: 0,
        attempts: 0,
        responseMs: 0,
      }
      current.attempts += 1
      current.responseMs += attempt.responseMs
      if (!attempt.correct) current.misses += 1
      scores.set(attempt.target.key, current)
    }
  }

  return [...scores.values()]
    .sort((a, b) => {
      const aWeakness =
        a.misses / a.attempts + a.responseMs / a.attempts / 10000
      const bWeakness =
        b.misses / b.attempts + b.responseMs / b.attempts / 10000
      return bWeakness - aWeakness
    })
    .slice(0, limit)
    .map(({ target }) => target)
}

export const shouldAdvanceDifficulty = (
  sessions: readonly PracticeSession[],
  exerciseId: string
): boolean =>
  sessions
    .filter(
      (session) =>
        session.exercise.id === exerciseId && session.status === "completed"
    )
    .slice(-2)
    .every((session, _, matches) =>
      matches.length === 2 ? summarizeSession(session).accuracy >= 0.85 : false
    )

export const nextTempo = (
  exercise: Extract<ExerciseDefinition, { kind: "tempoLadder" }>,
  currentBpm: number,
  recentClean: readonly boolean[]
): number => {
  if (recentClean.length >= 2 && recentClean.slice(-2).every(Boolean)) {
    return Math.min(exercise.targetBpm, currentBpm + exercise.increment)
  }
  if (
    recentClean.length >= 2 &&
    recentClean.slice(-2).every((clean) => !clean)
  ) {
    return Math.max(30, currentBpm - exercise.increment)
  }
  return currentBpm
}

export const getComparableSessions = (
  sessions: readonly PracticeSession[],
  exercise: ExerciseDefinition,
  limit = 5
): PracticeSession[] =>
  sessions
    .filter(
      (session) =>
        session.status === "completed" &&
        session.exercise.kind === exercise.kind
    )
    .slice(-limit)

export const getDifficultyBand = (
  sessions: readonly PracticeSession[],
  exercise: ExerciseDefinition
): DifficultyBand => {
  const comparable = getComparableSessions(sessions, exercise, 3)
  if (comparable.length < 2) return 0

  const recent = comparable.slice(-2)
  const reliableSuccess = recent.every((session) => {
    const summary = summarizeSession(session)
    const verified = session.attempts.every(
      (attempt) => attempt.verification === "app-verified"
    )
    return summary.accuracy >= (verified ? 0.85 : 0.95)
  })
  if (reliableSuccess) return comparable.length >= 3 ? 2 : 1

  const repeatedMisses = recent.every(
    (session) => summarizeSession(session).accuracy < 0.6
  )
  return repeatedMisses ? 0 : 1
}
