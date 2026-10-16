import test from "node:test"
import assert from "node:assert/strict"
import { resolveScaleRoute, getRouteQuestionId } from "../lib/note-routes"
import {
  createScaleRouteProgress,
  reduceRouteAction,
} from "../lib/practice/scale-route"
import {
  createScaleRouteExercise,
  encodeScaleRoutePracticeRequest,
  readScaleRoutePracticeRequest,
  resolveScaleRoutePracticeRequest,
} from "../lib/scale-route-practice"
import type {
  ScaleRouteSelection,
  ScaleRouteAction,
} from "../types/note-routes"
import type { PracticeSession } from "../types/practice"

const selection: ScaleRouteSelection = {
  root: "A",
  scaleId: "pentatonic_minor",
  tuningId: "standard",
  revision: "pentatonic-v1",
  pairId: "neighbor-boxes",
  placementId: "movable",
  routeId: "connection",
  direction: "ascending",
}
const at = "2026-03-01T12:00:00.000Z"
const snapshot = () => {
  const result = resolveScaleRoute(selection)
  if (!result.ok) throw new Error(result.error)
  return result.value
}
const session = (questionIds?: string[]): PracticeSession => {
  const exercise = createScaleRouteExercise(snapshot(), questionIds)
  return {
    id: "session",
    exercise,
    status: "running",
    startedAt: at,
    updatedAt: at,
    elapsedMs: 0,
    attempts: [],
    route: createScaleRouteProgress(exercise.snapshot, questionIds),
  }
}
const command = (
  s: PracticeSession,
  action: Partial<ScaleRouteAction>
): ScaleRouteAction =>
  ({
    id: "cmd",
    questionId: s.route!.questionIds[s.route!.questionIndex] ?? "",
    submissionOrdinal: s.route!.submissionOrdinal,
    at,
    type: "hint",
    ...action,
  }) as ScaleRouteAction

test("exercise construction copies snapshot and assessed scope", () => {
  const source = snapshot()
  const scope = [getRouteQuestionId(source, source.transitions[2].id)]
  const exercise = createScaleRouteExercise(source, scope)
  source.occurrences[0].fret = 99
  scope.length = 0
  assert.equal(exercise.snapshot.occurrences[0].fret, 5)
  assert.equal(exercise.assessmentQuestionIds!.length, 1)
  assert.equal(exercise.kind, "scaleRoute")
  assert.deepEqual(exercise.skillIds, ["scale.route"])
})

test("query round-trips all selections including sharp roots", () => {
  for (const root of [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ] as const) {
    const selected = { ...selection, root, direction: "descending" as const }
    const encoded = encodeScaleRoutePracticeRequest(selected)
    assert.ok(encoded.startsWith("?kind=scaleRoute&"))
    const query = Object.fromEntries(new URLSearchParams(encoded))
    assert.deepEqual(readScaleRoutePracticeRequest(query), {
      ok: true,
      value: selected,
    })
    const result = resolveScaleRoutePracticeRequest(query)
    assert.equal(result.ok, true)
    if (result.ok) assert.deepEqual(result.value.snapshot.selection, selected)
  }
})

test("query fails visibly on missing, repeated, and unknown catalog fields", () => {
  const query = Object.fromEntries(
    new URLSearchParams(encodeScaleRoutePracticeRequest(selection))
  )
  assert.deepEqual(readScaleRoutePracticeRequest(query), {
    ok: true,
    value: selection,
  })
  for (const key of ["kind", ...Object.keys(selection)]) {
    const missing = { ...query }
    delete missing[key]
    assert.equal(
      readScaleRoutePracticeRequest(missing).ok,
      false,
      `missing ${key}`
    )
    assert.equal(
      readScaleRoutePracticeRequest({ ...query, [key]: [query[key]] }).ok,
      false,
      `array ${key}`
    )
  }
  for (const [key, value] of [
    ["root", "H"],
    ["scaleId", "major"],
    ["tuningId", "drop-d"],
    ["revision", "future-v2"],
    ["pairId", "unknown"],
    ["placementId", "unknown"],
    ["routeId", "unknown"],
    ["direction", "sideways"],
    ["kind", "technique"],
  ]) {
    assert.equal(
      resolveScaleRoutePracticeRequest({ ...query, [key]: value }).ok,
      false
    )
  }
  const unrelated = readScaleRoutePracticeRequest({
    ...query,
    locale: ["en", "th"],
  })
  assert.deepEqual(unrelated, { ok: true, value: selection })
})

test("wrong answer retains task, retry succeeds, and next explicitly advances", () => {
  const initial = session()
  const questionId = initial.route!.questionIds[0]
  const wrong = reduceRouteAction(
    initial,
    command(initial, {
      type: "answer",
      id: "wrong",
      coordinate: { string: 0, fret: 7 },
    })
  )
  assert.equal(wrong.route!.questionIndex, 0)
  assert.equal(wrong.route!.submissionOrdinal, 2)
  assert.equal(wrong.route!.answered, false)
  assert.equal(wrong.route!.feedback, "outside-scale")
  assert.equal(initial.attempts.length, 0)
  const correct = reduceRouteAction(
    wrong,
    command(wrong, {
      type: "answer",
      id: "retry",
      coordinate: { string: 0, fret: 8 },
    })
  )
  assert.equal(correct.route!.questionIndex, 0)
  assert.equal(correct.route!.answered, true)
  assert.equal(correct.attempts.length, 2)
  assert.deepEqual(
    correct.attempts.map((a) => [a.correct, a.route!.submissionOrdinal]),
    [
      [false, 1],
      [true, 2],
    ]
  )
  assert.equal(correct.attempts[0].target.key, questionId)
  assert.equal(correct.attempts[0].target.skill, "scaleRoute")
  assert.equal(correct.attempts[0].skillId, "scale.route")
  assert.equal(correct.attempts[0].responseMs, 0)
  assert.equal(correct.attempts[0].verification, "app-verified")
  assert.equal(correct.attempts[0].createdAt, at)
  const next = reduceRouteAction(
    correct,
    command(correct, { type: "next", id: "next" })
  )
  assert.equal(next.route!.questionIndex, 1)
  assert.equal(next.route!.submissionOrdinal, 1)
  assert.equal(next.route!.answered, false)
  assert.equal(next.route!.feedback, null)
})

test("commands are idempotent and stale, paused, ready, and completed actions are no-ops", () => {
  const initial = session()
  const answer = command(initial, {
    type: "answer",
    id: "answer",
    coordinate: { string: 0, fret: 8 },
  })
  const updated = reduceRouteAction(initial, answer)
  assert.equal(updated.attempts.length, 1)
  assert.strictEqual(reduceRouteAction(updated, answer), updated)
  assert.strictEqual(
    reduceRouteAction(updated, { ...answer, id: "duplicate-activation" }),
    updated
  )
  assert.strictEqual(
    reduceRouteAction(initial, command(initial, { type: "next" })),
    initial
  )
  for (const status of ["paused", "ready", "completed", "abandoned"] as const) {
    const stopped = { ...initial, status }
    assert.strictEqual(reduceRouteAction(stopped, answer), stopped)
  }
  assert.strictEqual(
    reduceRouteAction(initial, { ...answer, questionId: "stale" }),
    initial
  )
  assert.strictEqual(
    reduceRouteAction(initial, { ...answer, submissionOrdinal: 99 }),
    initial
  )
})

test("hint assistance survives retries and pause without rewriting earlier submissions", () => {
  let s = session()
  s = reduceRouteAction(s, command(s, { id: "hint" }))
  assert.equal(s.route!.assisted, true)
  const paused = { ...s, status: "paused" as const }
  assert.strictEqual(
    reduceRouteAction(paused, command(paused, { id: "paused-hint" })),
    paused
  )
  s = { ...paused, status: "running" }
  s = reduceRouteAction(
    s,
    command(s, {
      type: "answer",
      id: "wrong",
      coordinate: { string: 0, fret: 7 },
    })
  )
  s = reduceRouteAction(
    s,
    command(s, {
      type: "answer",
      id: "correct",
      coordinate: { string: 0, fret: 8 },
    })
  )
  assert.deepEqual(
    s.attempts.map((a) => a.route!.assisted),
    [true, true]
  )
  s = reduceRouteAction(s, command(s, { type: "next", id: "next" }))
  assert.equal(s.route!.assisted, false)
  s = reduceRouteAction(
    s,
    command(s, {
      type: "answer",
      id: "new-wrong",
      coordinate: { string: 0, fret: 7 },
    })
  )
  s = reduceRouteAction(s, command(s, { id: "late-hint" }))
  assert.equal(s.attempts[2].route!.assisted, false)
  assert.equal(s.route!.assisted, true)
})

test("scoped check assesses transition destination then enters guitar and records participation only there", () => {
  const route = snapshot()
  const scope = [getRouteQuestionId(route, route.transitions[7].id)]
  let s = session(scope)
  assert.equal(s.route!.questionIds.length, 1)
  assert.strictEqual(
    reduceRouteAction(
      s,
      command(s, { type: "participation", status: "tried" })
    ),
    s
  )
  s = reduceRouteAction(
    s,
    command(s, {
      type: "answer",
      id: "answer",
      coordinate: { string: 3, fret: 9 },
    })
  )
  assert.equal(s.attempts[0].route!.occurrenceId, route.occurrences[8].id)
  assert.equal(s.attempts[0].correct, true)
  s = reduceRouteAction(s, command(s, { type: "next", id: "next" }))
  assert.equal(s.route!.phase, "guitar")
  const participation = command(s, {
    type: "participation",
    status: "tried",
    id: "guitar",
    at: "2026-03-01T12:01:00.000Z",
  })
  s = reduceRouteAction(s, participation)
  assert.equal(s.route!.phase, "finished")
  assert.deepEqual(s.application, {
    status: "tried",
    recordedAt: "2026-03-01T12:01:00.000Z",
  })
  assert.equal(s.attempts.length, 1)
  assert.strictEqual(reduceRouteAction(s, participation), s)
  assert.equal(createScaleRouteProgress(route, []).phase, "guitar")
  assert.throws(() => createScaleRouteProgress(route, ["unknown"]), /question/i)
  assert.throws(
    () => createScaleRouteProgress(route, [scope[0], scope[0]]),
    /question/i
  )
})

test("processed commands remain bounded and invalid answers cannot enter history", () => {
  let s = session()
  for (let i = 0; i < 150; i++)
    s = reduceRouteAction(s, command(s, { id: `hint-${i}` }))
  assert.equal(s.route!.processedCommandIds.length, 128)
  assert.equal(s.route!.processedCommandIds[0], "hint-22")
  assert.equal(s.route!.assisted, true)
  assert.strictEqual(
    reduceRouteAction(
      s,
      command(s, {
        type: "answer",
        id: "invalid",
        coordinate: { string: 0, fret: 22 },
      })
    ),
    s
  )
})
