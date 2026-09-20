import type { PracticeSession } from "@/types/practice"
import type { FretboardPathTarget } from "./paths"

type TargetStats = {
  attempts: number
  correct: number
  responseMs: number
  lastPracticedAt?: string
}

export type ReviewQueueOptions = {
  count: number
  seed: number
  now?: Date
  slowResponseMs?: number
}

const DAY_MS = 86_400_000

const seededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 4_294_967_296
  }
}

const collectStats = (
  targets: readonly FretboardPathTarget[],
  sessions: readonly PracticeSession[]
) => {
  const targetIds = new Set(targets.map((target) => target.id))
  const stats = new Map<string, TargetStats>()

  for (const session of sessions) {
    if (session.status !== "completed") continue
    for (const attempt of session.attempts) {
      if (
        attempt.verification !== "app-verified" ||
        !targetIds.has(attempt.target.key)
      ) {
        continue
      }
      const current = stats.get(attempt.target.key) ?? {
        attempts: 0,
        correct: 0,
        responseMs: 0,
      }
      current.attempts += 1
      current.correct += attempt.correct ? 1 : 0
      current.responseMs += attempt.responseMs
      if (
        !current.lastPracticedAt ||
        attempt.createdAt > current.lastPracticedAt
      ) {
        current.lastPracticedAt = attempt.createdAt
      }
      stats.set(attempt.target.key, current)
    }
  }

  return stats
}

const shuffle = <T>(values: readonly T[], random: () => number): T[] => {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(random() * (index + 1))
    ;[result[index], result[next]] = [result[next], result[index]]
  }
  return result
}

export const getDuePathTargetCount = (
  targets: readonly FretboardPathTarget[],
  sessions: readonly PracticeSession[],
  now = new Date(),
  slowResponseMs = 5_000
): number => {
  const stats = collectStats(targets, sessions)
  return targets.filter((target) => {
    const value = stats.get(target.id)
    if (!value) return true
    const accuracy = value.correct / value.attempts
    const averageResponseMs = value.responseMs / value.attempts
    const ageMs = value.lastPracticedAt
      ? now.getTime() - new Date(value.lastPracticedAt).getTime()
      : Number.POSITIVE_INFINITY
    return (
      accuracy < 0.8 || averageResponseMs > slowResponseMs || ageMs > 7 * DAY_MS
    )
  }).length
}

export const buildReviewQueue = (
  targets: readonly FretboardPathTarget[],
  sessions: readonly PracticeSession[],
  options: ReviewQueueOptions
): FretboardPathTarget[] => {
  if (targets.length === 0 || options.count <= 0) return []

  const now = options.now ?? new Date()
  const slowResponseMs = options.slowResponseMs ?? 5_000
  const stats = collectStats(targets, sessions)
  const random = seededRandom(options.seed)
  const gaps: FretboardPathTarget[] = []
  const due: { target: FretboardPathTarget; priority: number }[] = []
  const mastered: FretboardPathTarget[] = []

  for (const target of targets) {
    const value = stats.get(target.id)
    if (!value) {
      gaps.push(target)
      continue
    }
    const errorRate = 1 - value.correct / value.attempts
    const averageResponseMs = value.responseMs / value.attempts
    const slowWeight = Math.min(1, averageResponseMs / slowResponseMs) * 0.25
    const ageDays = value.lastPracticedAt
      ? Math.max(0, now.getTime() - new Date(value.lastPracticedAt).getTime()) /
        DAY_MS
      : 30
    const recencyWeight = Math.min(1, ageDays / 7) * 0.2
    const lowSampleWeight = (Math.max(0, 3 - value.attempts) / 3) * 0.15
    const priority = errorRate + slowWeight + recencyWeight + lowSampleWeight

    if (errorRate > 0.2 || averageResponseMs > slowResponseMs || ageDays > 7) {
      due.push({ target, priority })
    } else {
      mastered.push(target)
    }
  }

  due.sort((left, right) => right.priority - left.priority)
  const dueCount = Math.round(options.count * 0.6)
  const gapCount = Math.round(options.count * 0.25)
  const masteredCount = Math.max(0, options.count - dueCount - gapCount)
  const selected: FretboardPathTarget[] = [
    ...due.slice(0, dueCount).map(({ target }) => target),
    ...shuffle(gaps, random).slice(0, gapCount),
    ...shuffle(mastered, random).slice(0, masteredCount),
  ]
  const selectedIds = new Set(selected.map((target) => target.id))
  const remaining = shuffle(
    targets.filter((target) => !selectedIds.has(target.id)),
    random
  )

  selected.push(
    ...remaining.slice(0, Math.max(0, options.count - selected.length))
  )
  return shuffle(selected, random).slice(
    0,
    Math.min(options.count, targets.length)
  )
}
