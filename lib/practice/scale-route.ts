import { classifyRouteAnswer, getRouteQuestionId } from "@/lib/note-routes"
import type {
  RouteAnswerClassification,
  ScaleRouteAction,
  ScaleRouteProgress,
  ScaleRouteReport,
  ScaleRouteSnapshot,
} from "@/types/note-routes"
import type {
  PracticeAttempt,
  PracticeSession,
  ScaleRouteExercise,
} from "@/types/practice"
import type { RouteOccurrence } from "@/types/note-routes"

export const createScaleRouteProgress = (
  snapshotOrExercise: ScaleRouteExercise | ScaleRouteExercise["snapshot"],
  requestedQuestionIds?: string[]
): ScaleRouteProgress => {
  const exercise = "kind" in snapshotOrExercise ? snapshotOrExercise : null
  const snapshot: ScaleRouteSnapshot = exercise
    ? exercise.snapshot
    : (snapshotOrExercise as ScaleRouteSnapshot)
  const questionIds =
    requestedQuestionIds ??
    exercise?.assessmentQuestionIds ??
    snapshot.transitions.map((transition) =>
      getRouteQuestionId(snapshot, transition.id)
    )
  const available = new Set(
    snapshot.transitions.map((transition) =>
      getRouteQuestionId(snapshot, transition.id)
    )
  )
  if (
    questionIds.some((id) => !available.has(id)) ||
    new Set(questionIds).size !== questionIds.length
  )
    throw new Error("Invalid route question scope.")
  return {
    phase: questionIds.length ? "check" : "guitar",
    questionIds: [...questionIds],
    questionIndex: 0,
    submissionOrdinal: 1,
    assisted: false,
    feedback: null,
    answered: false,
    processedCommandIds: [],
  }
}

const currentQuestion = (session: PracticeSession) => {
  if (session.exercise.kind !== "scaleRoute" || !session.route) return null
  const { snapshot } = session.exercise
  const questionId = session.route.questionIds[session.route.questionIndex]
  if (!questionId) return null
  const transition = snapshot.transitions.find(
    (item) => getRouteQuestionId(snapshot, item.id) === questionId
  )
  if (!transition) return null
  const occurrence = snapshot.occurrences.find(
    (item) => item.id === transition.toId
  )
  return occurrence ? { questionId, transition, occurrence } : null
}

const makeRouteAttempt = (
  session: PracticeSession,
  action: Extract<ScaleRouteAction, { type: "answer" }>,
  expected: RouteOccurrence,
  correct: boolean,
  feedback: RouteAnswerClassification
): PracticeAttempt => ({
  id: `route-attempt:${action.id}`,
  prompt: `Continue the guided route at string ${expected.string + 1}, fret ${expected.fret}`,
  answer: `${action.coordinate.string}:${action.coordinate.fret}:${feedback}`,
  expected: `${expected.string}:${expected.fret}`,
  correct,
  responseMs: 0,
  createdAt: action.at,
  verification: "app-verified",
  target: {
    skill: "scaleRoute",
    key: action.questionId,
    string: expected.string,
    fret: expected.fret,
    note: expected.note,
    interval: expected.interval,
  },
  skillId: "scale.route",
  route: {
    questionId: action.questionId,
    transitionId: currentQuestion(session)!.transition.id,
    occurrenceId: expected.id,
    submissionOrdinal: session.route!.submissionOrdinal,
    selected: { ...action.coordinate },
    expected: { string: expected.string, fret: expected.fret },
    assisted: session.route!.assisted,
  },
})

export const reduceRouteAction = (
  session: PracticeSession,
  action: ScaleRouteAction
): PracticeSession => {
  const progress = session.route
  const current = currentQuestion(session)
  if (
    session.exercise.kind !== "scaleRoute" ||
    session.status !== "running" ||
    !progress ||
    progress.phase === "finished" ||
    progress.processedCommandIds.includes(action.id) ||
    (progress.phase !== "guitar" && !current) ||
    progress.submissionOrdinal !== action.submissionOrdinal
  )
    return session
  if (current && current.questionId !== action.questionId) return session

  const markProcessed = (next: ScaleRouteProgress): ScaleRouteProgress => ({
    ...next,
    processedCommandIds: [...progress.processedCommandIds, action.id].slice(
      -128
    ),
  })

  if (action.type === "hint") {
    if (progress.phase !== "check" || progress.answered) return session
    return {
      ...session,
      route: markProcessed({ ...progress, assisted: true }),
      updatedAt: action.at,
    }
  }

  if (action.type === "answer") {
    if (
      !current ||
      progress.phase !== "check" ||
      progress.answered ||
      !Number.isInteger(action.coordinate.string) ||
      action.coordinate.string < 0 ||
      action.coordinate.string > 5 ||
      !Number.isInteger(action.coordinate.fret) ||
      action.coordinate.fret < 0 ||
      action.coordinate.fret > 21
    )
      return session
    const classification = classifyRouteAnswer(
      session.exercise.snapshot,
      current.occurrence,
      action.coordinate
    )
    const correct = classification === "exact"
    const attempt = makeRouteAttempt(
      session,
      action,
      current.occurrence,
      correct,
      classification
    )
    const nextProgress = markProcessed({
      ...progress,
      submissionOrdinal: progress.submissionOrdinal + (correct ? 0 : 1),
      feedback: classification,
      answered: correct,
    })
    return {
      ...session,
      attempts: [...session.attempts, attempt],
      route: nextProgress,
      updatedAt: action.at,
    }
  }

  if (action.type === "next") {
    if (progress.phase !== "check" || !progress.answered) return session
    const nextIndex = progress.questionIndex + 1
    const finishedCheck = nextIndex >= progress.questionIds.length
    return {
      ...session,
      route: markProcessed({
        ...progress,
        phase: finishedCheck ? "guitar" : "check",
        questionIndex: finishedCheck ? progress.questionIndex : nextIndex,
        submissionOrdinal: 1,
        assisted: false,
        feedback: null,
        answered: false,
      }),
      updatedAt: action.at,
    }
  }

  if (action.type === "participation" && progress.phase === "guitar") {
    return {
      ...session,
      application: { status: action.status, recordedAt: action.at },
      route: markProcessed({ ...progress, phase: "finished" }),
      updatedAt: action.at,
    }
  }
  return session
}

export const getAssessmentAttempts = (
  session: PracticeSession
): PracticeAttempt[] => {
  if (session.exercise.kind !== "scaleRoute") return [...session.attempts]
  const first = new Map<string, PracticeAttempt>()
  for (const attempt of session.attempts) {
    if (!attempt.route || attempt.route.submissionOrdinal !== 1) continue
    const previous = first.get(attempt.route.questionId)
    if (!previous || attempt.createdAt < previous.createdAt)
      first.set(attempt.route.questionId, attempt)
  }
  return [...first.values()].filter(
    (attempt) => attempt.route && !attempt.route.assisted
  )
}

export const getScaleRouteReport = (
  session: PracticeSession
): ScaleRouteReport => {
  if (session.exercise.kind !== "scaleRoute") {
    return {
      eligibleFirst: 0,
      correctFirst: 0,
      accuracy: null,
      assistedFirst: 0,
      retries: 0,
      missedTransitionIds: [],
      answeredQuestions: 0,
      totalQuestions: 0,
      participation: null,
    }
  }
  const routeAttempts = session.attempts.filter((attempt) => attempt.route)
  const firstByQuestion = new Map<string, PracticeAttempt>()
  for (const attempt of routeAttempts) {
    const provenance = attempt.route!
    if (provenance.submissionOrdinal !== 1) continue
    if (!firstByQuestion.has(provenance.questionId))
      firstByQuestion.set(provenance.questionId, attempt)
  }
  const eligible = [...firstByQuestion.values()].filter(
    (attempt) => !attempt.route!.assisted
  )
  const correctFirst = eligible.filter((attempt) => attempt.correct).length
  const answered = new Set(
    routeAttempts.map((attempt) => attempt.route!.questionId)
  ).size
  const missedTransitionIds = [...firstByQuestion.values()]
    .filter((attempt) => !attempt.correct)
    .map((attempt) => attempt.route!.transitionId)
  return {
    eligibleFirst: eligible.length,
    correctFirst,
    accuracy: eligible.length ? correctFirst / eligible.length : null,
    assistedFirst: [...firstByQuestion.values()].filter(
      (attempt) => attempt.route!.assisted
    ).length,
    retries: Math.max(0, routeAttempts.length - firstByQuestion.size),
    missedTransitionIds,
    answeredQuestions: answered,
    totalQuestions:
      session.route?.questionIds.length ??
      session.exercise.assessmentQuestionIds?.length ??
      session.exercise.snapshot.transitions.length,
    participation: session.application?.status ?? null,
  }
}
