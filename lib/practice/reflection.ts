import type { ExerciseKind, PracticeSession } from "@/types/practice"
import { summarizeSession } from "./scoring"

const NEXT_STEP: Record<ExerciseKind, string> = {
  fretboardRecall: "Next time, find the same notes on a different string.",
  tempoLadder:
    "Next time, begin at your last comfortable tempo and aim for one clean step.",
  technique: "Next time, keep the motion relaxed before raising the tempo.",
  chordTransition:
    "Next time, use the same chord changes in a simple four-beat groove.",
  earTraining: "Next time, sing the interval before choosing an answer.",
  rhythm: "Next time, keep the pulse going when the click drops out.",
  positionConnection: "Next time, play the connection in both directions.",
  construction: "Next time, find one of today's answers on the guitar.",
}

export const getSessionReflection = (
  session: PracticeSession,
  sessions: readonly PracticeSession[]
): { observation: string; nextStep: string } | null => {
  if (session.status !== "completed" || session.attempts.length === 0)
    return null

  const current = summarizeSession(session)
  const previousSession = sessions
    .filter(
      (item) =>
        item.id !== session.id &&
        item.status === "completed" &&
        item.exercise.id === session.exercise.id &&
        item.attempts.length > 0 &&
        Date.parse(item.startedAt) < Date.parse(session.startedAt)
    )
    .at(-1)
  const previous = previousSession ? summarizeSession(previousSession) : null
  let observation: string | undefined

  if (previous && session.exercise.kind === "tempoLadder") {
    if (
      current.bestBpm !== null &&
      previous.bestBpm !== null &&
      current.bestBpm > previous.bestBpm
    ) {
      observation = `Your clean tempo rose by ${current.bestBpm - previous.bestBpm} BPM since the last attempt.`
    }
  } else if (previous && session.exercise.kind === "rhythm") {
    if (
      current.timingVariabilityMs !== null &&
      previous.timingVariabilityMs !== null &&
      previous.timingVariabilityMs - current.timingVariabilityMs >= 10
    ) {
      observation = `Your timing spread narrowed by ${Math.round(previous.timingVariabilityMs - current.timingVariabilityMs)} ms since the last attempt.`
    }
  } else if (
    previous &&
    session.attempts.length >= 4 &&
    previousSession?.attempts.length &&
    previousSession.attempts.length >= 4 &&
    session.attempts.every(
      (attempt) => attempt.verification === "app-verified"
    ) &&
    previousSession.attempts.every(
      (attempt) => attempt.verification === "app-verified"
    )
  ) {
    const improvement = Math.round((current.accuracy - previous.accuracy) * 100)
    if (improvement >= 5) {
      observation = `Accuracy improved by ${improvement} points since the last attempt.`
    }
  }

  return {
    observation:
      observation ??
      `You recorded ${current.attemptCount} ${current.attemptCount === 1 ? "attempt" : "attempts"} to guide your next practice.`,
    nextStep: NEXT_STEP[session.exercise.kind],
  }
}
