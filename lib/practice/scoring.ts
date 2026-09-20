import type {
  PracticeAttempt,
  PracticeSession,
  SessionSummary,
} from "@/types/practice"

const average = (values: number[]): number | null =>
  values.length === 0
    ? null
    : values.reduce((total, value) => total + value, 0) / values.length

const standardDeviation = (values: number[]): number | null => {
  const mean = average(values)
  if (mean === null) return null
  const variance = average(values.map((value) => (value - mean) ** 2))
  return variance === null ? null : Math.sqrt(variance)
}

export const calculateAccuracy = (attempts: readonly PracticeAttempt[]) => {
  if (attempts.length === 0) return 0
  return attempts.filter((attempt) => attempt.correct).length / attempts.length
}

export const summarizeSession = (session: PracticeSession): SessionSummary => {
  const correctAttempts = session.attempts.filter((attempt) => attempt.correct)
  const responseTimes = session.attempts.map((attempt) => attempt.responseMs)
  const offsets = session.attempts.flatMap((attempt) =>
    attempt.timingOffsetMs === undefined
      ? []
      : [Math.abs(attempt.timingOffsetMs)]
  )
  const cleanBpms = correctAttempts.flatMap((attempt) =>
    attempt.bpm === undefined ? [] : [attempt.bpm]
  )
  const allBpms = session.attempts.flatMap((attempt) =>
    attempt.bpm === undefined ? [] : [attempt.bpm]
  )

  return {
    sessionId: session.id,
    exerciseKind: session.exercise.kind,
    durationMs: session.elapsedMs,
    attemptCount: session.attempts.length,
    correctCount: correctAttempts.length,
    accuracy: calculateAccuracy(session.attempts),
    averageResponseMs: average(responseTimes),
    averageTimingOffsetMs: average(offsets),
    timingVariabilityMs: standardDeviation(offsets),
    bestBpm: cleanBpms.length === 0 ? null : Math.max(...cleanBpms),
    comfortableBpm:
      allBpms.length === 0
        ? null
        : Math.max(
            ...allBpms.filter((bpm) => {
              const atTempo = session.attempts.filter(
                (attempt) => attempt.bpm === bpm
              )
              return calculateAccuracy(atTempo) >= 0.8
            }),
            0
          ) || null,
    completion: session.status === "completed" ? "completed" : "abandoned",
  }
}
