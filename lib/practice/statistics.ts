import type {
  PersonalBest,
  PracticeSession,
  SkillRating,
} from "@/types/practice"
import { summarizeSession } from "./scoring"

export const getLocalDayKey = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const getPracticeMinutes = (
  sessions: readonly PracticeSession[],
  since?: Date
): number =>
  Math.round(
    sessions
      .filter(
        (session) => !since || Date.parse(session.startedAt) >= since.getTime()
      )
      .reduce((total, session) => total + session.elapsedMs, 0) / 60000
  )

export const getPracticeDayKeys = (
  sessions: readonly PracticeSession[]
): string[] =>
  [...new Set(sessions.map((session) => getLocalDayKey(session.startedAt)))].sort()

export const getCurrentStreak = (
  sessions: readonly PracticeSession[],
  today = new Date()
): number => {
  const days = new Set(getPracticeDayKeys(sessions))
  const cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)
  const todayKey = getLocalDayKey(cursor)
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (days.has(getLocalDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export const getSkillRatings = (
  sessions: readonly PracticeSession[]
): SkillRating[] => {
  const targets = new Map<
    string,
    { skill: SkillRating["skill"]; correct: number; attempts: number; response: number; last: string }
  >()
  sessions.forEach((session) =>
    session.attempts.forEach((attempt) => {
      const key = `${attempt.target.skill}:${attempt.target.key}`
      const current = targets.get(key) ?? {
        skill: attempt.target.skill,
        correct: 0,
        attempts: 0,
        response: 0,
        last: attempt.createdAt,
      }
      current.attempts += 1
      current.correct += attempt.correct ? 1 : 0
      current.response += attempt.responseMs
      if (attempt.createdAt > current.last) current.last = attempt.createdAt
      targets.set(key, current)
    })
  )

  return [...targets.entries()].map(([key, value]) => {
    const accuracy = value.correct / value.attempts
    const averageResponseMs = value.response / value.attempts
    return {
      skill: value.skill,
      targetKey: key.slice(value.skill.length + 1),
      attempts: value.attempts,
      accuracy,
      averageResponseMs,
      strength: Math.round(
        Math.max(0, Math.min(100, accuracy * 80 + Math.max(0, 20 - averageResponseMs / 500)))
      ),
      lastPracticedAt: value.last,
    }
  })
}

export const getPersonalBests = (
  sessions: readonly PracticeSession[]
): PersonalBest[] => {
  const bests = new Map<string, PersonalBest>()
  sessions
    .filter((session) => session.status === "completed")
    .forEach((session) => {
      const summary = summarizeSession(session)
      const candidates: PersonalBest[] = [
        {
          exerciseId: session.exercise.id,
          exerciseName: session.exercise.name,
          metric: "accuracy",
          value: Math.round(summary.accuracy * 100),
          achievedAt: session.completedAt ?? session.updatedAt,
          verification:
            session.attempts.every(
              (attempt) => attempt.verification === "app-verified"
            )
              ? "app-verified"
              : "self-reported",
        },
      ]
      if (summary.bestBpm !== null) {
        candidates.push({ ...candidates[0], metric: "bpm", value: summary.bestBpm })
      }
      candidates.forEach((candidate) => {
        const key = `${candidate.exerciseId}:${candidate.metric}`
        if ((bests.get(key)?.value ?? -Infinity) < candidate.value) {
          bests.set(key, candidate)
        }
      })
    })
  return [...bests.values()].toSorted((a, b) => b.value - a.value)
}
