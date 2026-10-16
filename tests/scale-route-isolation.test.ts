import assert from "node:assert/strict"
import { test } from "node:test"
import { resolveScaleRoute } from "../lib/note-routes"
import { createDefaultExercise } from "../lib/practice/exercises"
import {
  getAssessmentAttempts,
  getScaleRouteReport,
  reduceRouteAction,
} from "../lib/practice/scale-route"
import { getPersonalBests, getSkillRatings } from "../lib/practice/statistics"
import { summarizeSession } from "../lib/practice/scoring"
import { getWeakTargets } from "../lib/practice/progression"
import { getSkillEvidence } from "../lib/learning/evidence"
import { createScaleRouteExercise } from "../lib/scale-route-practice"
import type { PracticeSession } from "../types/practice"

const at = "2026-10-10T00:00:00.000Z"
const routeResult = resolveScaleRoute({
  root: "A",
  scaleId: "pentatonic_minor",
  tuningId: "standard",
  revision: "pentatonic-v1",
  pairId: "neighbor-boxes",
  placementId: "movable",
  routeId: "connection",
  direction: "ascending",
})
if (!routeResult.ok) throw new Error("route fixture")
const routeExercise = createScaleRouteExercise(routeResult.value)
let routeSession: PracticeSession = {
  id: "route",
  exercise: routeExercise,
  status: "completed",
  startedAt: at,
  updatedAt: at,
  completedAt: at,
  elapsedMs: 50_000,
  attempts: [],
  route: {
    phase: "finished",
    questionIds: [],
    questionIndex: 0,
    submissionOrdinal: 1,
    assisted: false,
    feedback: null,
    answered: false,
    processedCommandIds: [],
  },
}
const baseSession: PracticeSession = {
  id: "legacy",
  exercise: createDefaultExercise("fretboardRecall"),
  status: "completed",
  startedAt: at,
  updatedAt: at,
  elapsedMs: 50_000,
  attempts: [
    {
      id: "old",
      prompt: "Find C",
      answer: "C",
      expected: "C",
      correct: true,
      responseMs: 900,
      createdAt: at,
      verification: "app-verified",
      target: {
        skill: "fretboardRecall",
        key: "old:C",
        string: 0,
        fret: 8,
        note: "C",
      },
    },
  ],
}

test("untimed route evidence cannot populate speed, strength, review, heatmap, or personal-best inputs", () => {
  let session: PracticeSession = {
    ...routeSession,
    status: "running",
    route: {
      ...routeSession.route!,
      phase: "check",
      questionIds: [
        routeResult.value.transitions
          .slice(0, 1)
          .map(
            (t) =>
              `scale-route:${JSON.stringify(["pentatonic-v1", "A", "pentatonic_minor", "standard", "neighbor-boxes", "movable", "connection", "ascending", t.id, t.fromId, t.toId])}`
          )[0],
      ],
      questionIndex: 0,
    },
  }
  const questionId = session.route!.questionIds[0]
  session = reduceRouteAction(session, {
    id: "wrong",
    questionId,
    submissionOrdinal: 1,
    at,
    type: "answer",
    coordinate: { string: 0, fret: 7 },
  })
  session = reduceRouteAction(session, {
    id: "retry",
    questionId,
    submissionOrdinal: 2,
    at,
    type: "answer",
    coordinate: { string: 0, fret: 8 },
  })
  session = { ...session, status: "completed", completedAt: at }
  routeSession = session
  const summary = summarizeSession(session)
  assert.equal(summary.accuracy, 0)
  assert.equal(summary.attemptCount, 1)
  assert.equal(summary.averageResponseMs, null)
  assert.equal(summary.bestBpm, null)
  assert.equal(getScaleRouteReport(session).retries, 1)
  assert.deepEqual(getAssessmentAttempts(session), [session.attempts[0]])
  assert.deepEqual(getSkillRatings([session]), [])
  assert.deepEqual(getPersonalBests([session]), [])
  assert.deepEqual(getWeakTargets([session]), [])
  assert.deepEqual(getSkillEvidence([session]), [])
})

test("legacy summaries and skill ratings retain their measured meaning", () => {
  const summary = summarizeSession(baseSession)
  assert.equal(summary.accuracy, 1)
  assert.equal(summary.attemptCount, 1)
  assert.equal(summary.averageResponseMs, 900)
  assert.equal(getSkillRatings([baseSession])[0].averageResponseMs, 900)
  assert.equal(getPersonalBests([baseSession])[0].value, 100)
})
