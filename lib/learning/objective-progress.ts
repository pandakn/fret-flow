import type { PracticeSession } from "@/types/practice"
import type { LearningAssignment } from "@/types/learning"
import { OBJECTIVES } from "./catalog"
import { getDueLearningTargets, type DueTarget } from "./review"

export type ObjectiveProgress = {
  objectiveId: string
  status: "no-check" | "needs-practice" | "check-passed"
  latestCheck?: {
    passed: boolean
    correct: number
    attempts: number
    completedAt: string
    assignment: LearningAssignment
  }
  guidedSessions: number
  applications: number
  dueTargets: DueTarget[]
}

export function getQuickCheckResult(session: PracticeSession) {
  const assignment = session.learning ?? session.exercise.learning
  if (session.status !== "completed" || assignment?.origin !== "quick-check")
    return null
  const attempts = session.attempts
  const verified =
    attempts.length >= 4 &&
    attempts.every((attempt) => attempt.verification === "app-verified")
  const correct = attempts.filter((attempt) => attempt.correct).length
  return {
    passed: verified && correct / attempts.length >= 0.75,
    correct,
    attempts: attempts.length,
    completedAt: session.completedAt ?? session.updatedAt,
    assignment,
  }
}

export function getObjectiveProgress(
  sessions: readonly PracticeSession[],
  now = new Date()
): ObjectiveProgress[] {
  const due = getDueLearningTargets(sessions, now)
  return OBJECTIVES.map((objective) => {
    const linked = sessions.filter((session) => {
      const assignment = session.learning ?? session.exercise.learning
      return (
        session.status === "completed" &&
        assignment?.objectiveId === objective.id
      )
    })
    const latestCheck = linked
      .flatMap((session) => {
        const result = getQuickCheckResult(session)
        return result ? [result] : []
      })
      .toSorted((a, b) => b.completedAt.localeCompare(a.completedAt))[0]
    return {
      objectiveId: objective.id,
      status: latestCheck
        ? latestCheck.passed
          ? ("check-passed" as const)
          : ("needs-practice" as const)
        : ("no-check" as const),
      latestCheck,
      guidedSessions: linked.filter(
        (session) =>
          (session.learning ?? session.exercise.learning)?.origin ===
          "guided-practice"
      ).length,
      applications: linked.filter(
        (session) => session.application?.status === "tried"
      ).length,
      dueTargets: due.filter(
        (target) => target.assignment.objectiveId === objective.id
      ),
    }
  })
}
