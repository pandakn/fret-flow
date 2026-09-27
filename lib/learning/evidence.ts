import type { PracticeSession } from "@/types/practice"
import { lessonsForSkill } from "./catalog"

export type SkillEvidence = {
  skillId: string
  attempts: number
  correct: number
  accuracy: number
  verified: boolean
  lastPracticedAt: string
}

const legacySkillId = (session: PracticeSession): string | undefined => {
  const exercise = session.exercise
  if (exercise.kind === "construction") {
    if (exercise.category === "interval") return "interval.construct"
    if (exercise.category === "triad") return "triad.construct"
    if (exercise.category === "seventh") return "seventh.construct"
    if (exercise.category === "diatonic") return "diatonic.chord.identify"
  }
  if (exercise.kind === "fretboardRecall")
    return exercise.recall === "root"
      ? "fretboard.root.locate"
      : exercise.recall === "interval"
        ? "fretboard.interval.locate"
        : "fretboard.note.locate"
  if (exercise.kind === "earTraining" && exercise.category === "interval")
    return "ear.interval.recognize"
  if (exercise.kind === "positionConnection") return "position.connect"
  if (exercise.kind === "rhythm") return "rhythm.pulse"
  return undefined
}

export function getSkillEvidence(
  sessions: readonly PracticeSession[]
): SkillEvidence[] {
  const rows = new Map<
    string,
    { attempts: number; correct: number; verified: boolean; last: string }
  >()
  for (const session of sessions) {
    if (session.status !== "completed") continue
    const fallback =
      session.learning?.skillIds[0] ??
      session.exercise.learning?.skillIds[0] ??
      session.exercise.skillIds?.[0] ??
      legacySkillId(session)
    for (const attempt of session.attempts) {
      const skillId = attempt.skillId ?? fallback
      if (!skillId) continue
      const current = rows.get(skillId) ?? {
        attempts: 0,
        correct: 0,
        verified: true,
        last: attempt.createdAt,
      }
      current.attempts++
      if (attempt.correct) current.correct++
      current.verified &&= attempt.verification === "app-verified"
      if (attempt.createdAt > current.last) current.last = attempt.createdAt
      rows.set(skillId, current)
    }
  }
  return [...rows].map(([skillId, row]) => ({
    skillId,
    attempts: row.attempts,
    correct: row.correct,
    accuracy: row.correct / row.attempts,
    verified: row.verified,
    lastPracticedAt: row.last,
  }))
}

export function getWeakLessonRecommendation(
  session: PracticeSession,
  sessions: readonly PracticeSession[]
) {
  if (session.status !== "completed" || session.attempts.length < 4) return null
  const skillId =
    session.learning?.skillIds[0] ??
    session.exercise.learning?.skillIds[0] ??
    session.exercise.skillIds?.[0] ??
    legacySkillId(session)
  if (!skillId) return null
  const recent = sessions
    .filter(
      (item) =>
        item.status === "completed" &&
        (item.learning?.skillIds.includes(skillId) ||
          item.exercise.learning?.skillIds.includes(skillId) ||
          item.exercise.skillIds?.includes(skillId) ||
          legacySkillId(item) === skillId)
    )
    .slice(-3)
  const verified = recent
    .flatMap((item) => item.attempts)
    .filter((attempt) => attempt.verification === "app-verified")
  const selfReported = recent
    .flatMap((item) => item.attempts)
    .filter((attempt) => attempt.verification === "self-reported")
  const verifiedWeak =
    verified.length >= 4 &&
    verified.filter((attempt) => !attempt.correct).length >= 2 &&
    verified.filter((attempt) => attempt.correct).length / verified.length < 0.7
  const selfReportedWeak =
    recent.length >= 2 &&
    selfReported.length >= 6 &&
    selfReported.filter((attempt) => !attempt.correct).length >= 3 &&
    selfReported.filter((attempt) => attempt.correct).length /
      selfReported.length <
      0.5
  if (!verifiedWeak && !selfReportedWeak) return null
  const lesson = lessonsForSkill(skillId)[0]
  return lesson
    ? {
        skillId,
        lessonId: lesson.id,
        source: verifiedWeak
          ? ("verified" as const)
          : ("self-reported" as const),
      }
    : null
}
