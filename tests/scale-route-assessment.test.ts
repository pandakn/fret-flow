import assert from "node:assert/strict"
import { test } from "node:test"
import { resolveScaleRoute } from "../lib/note-routes"
import {
  createScaleRouteProgress,
  getAssessmentAttempts,
  getScaleRouteReport,
  reduceRouteAction,
} from "../lib/practice/scale-route"
import { createScaleRouteExercise } from "../lib/scale-route-practice"
import type { PracticeSession } from "../types/practice"
import type { ScaleRouteAction } from "../types/note-routes"

const selection = {
  root: "A",
  scaleId: "pentatonic_minor",
  tuningId: "standard",
  revision: "pentatonic-v1",
  pairId: "neighbor-boxes",
  placementId: "movable",
  routeId: "connection",
  direction: "ascending",
} as const
const resolved = resolveScaleRoute(selection)
if (!resolved.ok) throw new Error("Fixture route did not resolve")
const snapshot = resolved.value
const date = "2026-03-01T12:00:00.000Z"
const makeSession = (): PracticeSession => {
  const exercise = createScaleRouteExercise(snapshot)
  return {
    id: "test",
    exercise,
    status: "running",
    startedAt: date,
    updatedAt: date,
    elapsedMs: 1,
    attempts: [],
    route: createScaleRouteProgress(snapshot),
  }
}
const dispatch = (
  session: PracticeSession,
  id: string,
  action: Partial<ScaleRouteAction>
): PracticeSession =>
  reduceRouteAction(session, {
    id,
    questionId: session.route!.questionIds[session.route!.questionIndex],
    submissionOrdinal: session.route!.submissionOrdinal,
    at: date,
    type: "hint",
    ...action,
  } as ScaleRouteAction)

test("assessment evidence keeps first misses separate from successful retries", () => {
  let session = makeSession()
  session = dispatch(session, "wrong", {
    type: "answer",
    coordinate: { string: 0, fret: 7 },
  })
  session = dispatch(session, "retry", {
    type: "answer",
    coordinate: { string: 0, fret: 8 },
  })
  const report = getScaleRouteReport(session)
  assert.equal(report.eligibleFirst, 1)
  assert.equal(report.correctFirst, 0)
  assert.equal(report.accuracy, 0)
  assert.equal(report.retries, 1)
  assert.deepEqual(report.missedTransitionIds, [snapshot.transitions[0].id])
  assert.equal(session.attempts[1].correct, true)
  assert.deepEqual(getAssessmentAttempts(session), [session.attempts[0]])
})

test("assisted first submissions do not create an accuracy denominator", () => {
  let session = makeSession()
  session = dispatch(session, "hint", { type: "hint" })
  session = dispatch(session, "answer", {
    type: "answer",
    coordinate: { string: 0, fret: 8 },
  })
  const report = getScaleRouteReport(session)
  assert.equal(report.assistedFirst, 1)
  assert.equal(report.eligibleFirst, 0)
  assert.equal(report.accuracy, null)
  assert.deepEqual(getAssessmentAttempts(session), [])
})

test("eligible first submissions remain independently reportable after retries", () => {
  let session = makeSession()
  session = dispatch(session, "answer", {
    type: "answer",
    coordinate: { string: 0, fret: 8 },
  })
  const first = session.attempts[0]
  session = dispatch(session, "next", { type: "next" })
  session = dispatch(session, "hint", { type: "hint" })
  session = dispatch(session, "assisted-answer", {
    type: "answer",
    coordinate: { string: 0, fret: 5 },
  })
  const report = getScaleRouteReport(session)
  assert.equal(report.eligibleFirst, 1)
  assert.equal(report.correctFirst, 1)
  assert.equal(report.accuracy, 1)
  assert.equal(report.assistedFirst, 1)
  assert.equal(report.answeredQuestions, 2)
  assert.deepEqual(getAssessmentAttempts(session), [first])
})

test("legacy attempts pass through unchanged", () => {
  const legacy = makeSession()
  const attempt = {
    id: "legacy",
    prompt: "old quiz",
    answer: "A",
    expected: "A",
    correct: true,
    responseMs: 500,
    createdAt: date,
    verification: "app-verified" as const,
    target: { skill: "positionConnection" as const, key: "old-position" },
  }
  const oldSession = {
    ...legacy,
    exercise: {
      ...legacy.exercise,
      kind: "positionConnection" as const,
      root: "A" as const,
      scaleId: "major",
      fromPosition: 1,
      toPosition: 2,
    },
    attempts: [attempt],
    route: undefined,
  }
  assert.deepEqual(getAssessmentAttempts(oldSession), [attempt])
})
