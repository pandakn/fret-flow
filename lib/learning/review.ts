import type { PracticeSession, PracticeTarget } from "@/types/practice"
import type { LearningAssignment } from "@/types/learning"
import { SKILLS } from "./catalog"

export type DueTarget = {
  skillId: string
  key: string
  priority: number
  target: PracticeTarget
  assignment: LearningAssignment
}
const DAY_MS = 86_400_000

export function getDueLearningTargets(
  sessions: readonly PracticeSession[],
  now = new Date()
): DueTarget[] {
  const reviewable = new Set<string>(
    SKILLS.filter((skill) => skill.reviewable).map((skill) => skill.id)
  )
  const stats = new Map<
    string,
    {
      skillId: string
      key: string
      count: number
      correct: number
      last: number
      target: PracticeTarget
      assignment: LearningAssignment
    }
  >()
  for (const session of sessions) {
    if (session.status !== "completed") continue
    const assignment = session.learning ?? session.exercise.learning
    if (!assignment) continue
    for (const attempt of session.attempts) {
      const skillId = attempt.skillId ?? assignment.skillIds[0]
      if (
        !skillId ||
        !reviewable.has(skillId) ||
        attempt.verification !== "app-verified"
      )
        continue
      const id = `${skillId}:${attempt.target.key}`
      const current = stats.get(id) ?? {
        skillId,
        key: attempt.target.key,
        count: 0,
        correct: 0,
        last: 0,
        target: attempt.target,
        assignment,
      }
      current.count++
      if (attempt.correct) current.correct++
      const attemptedAt = Date.parse(attempt.createdAt)
      if (attemptedAt >= current.last) {
        current.last = attemptedAt
        current.assignment = assignment
        current.target = attempt.target
      }
      stats.set(id, current)
    }
  }
  return [...stats.values()]
    .flatMap((row) => {
      const ageDays = Math.max(0, (now.getTime() - row.last) / DAY_MS)
      const errorRate = 1 - row.correct / row.count
      if (errorRate < 0.2 && ageDays < 7) return []
      return [
        {
          skillId: row.skillId,
          key: row.key,
          priority: errorRate + Math.min(1, ageDays / 7) * 0.2,
          target: row.target,
          assignment: row.assignment,
        },
      ]
    })
    .toSorted((a, b) => b.priority - a.priority)
}
