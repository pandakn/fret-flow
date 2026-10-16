import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise } from "../lib/practice/exercises"
import { resolveScaleRoute } from "../lib/note-routes"
import {
  createScaleRouteProgress,
  reduceRouteAction,
} from "../lib/practice/scale-route"
import { createScaleRouteExercise } from "../lib/scale-route-practice"
import type { PracticeSession } from "../types/practice"
import {
  createEmptyPracticeDocument,
  readPracticeStorage,
  PRACTICE_STORAGE_KEY,
  LEGACY_PRACTICE_STORAGE_KEY,
  validatePracticeDocument,
  clonePracticeExercise,
} from "../lib/practice/storage"

class MemoryStorage {
  data = new Map<string, string>()
  writes = 0
  fail = false
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  setItem(key: string, value: string) {
    if (this.fail) throw new Error("quota")
    this.writes++
    this.data.set(key, value)
  }
}
const legacySession = () => ({
  id: "history",
  exercise: createDefaultExercise("construction"),
  status: "completed",
  startedAt: "2026-10-10T00:00:00Z",
  updatedAt: "2026-10-10T00:00:00Z",
  elapsedMs: 123,
  attempts: [],
})

describe("non-destructive practice hydration", () => {
  for (const version of [0, 1, 2, 3, 4]) {
    test(`imports v${version} history once and preserves the legacy key`, () => {
      const storage = new MemoryStorage()
      const raw = JSON.stringify({
        ...createEmptyPracticeDocument(),
        version,
        sessions: [legacySession()],
      })
      storage.data.set(LEGACY_PRACTICE_STORAGE_KEY, raw)
      const document = readPracticeStorage(storage)
      assert.equal(document.version, 5)
      assert.equal(document.sessions[0].id, "history")
      assert.equal(document.sessions[0].elapsedMs, 123)
      assert.equal(storage.getItem(LEGACY_PRACTICE_STORAGE_KEY), raw)
      assert.equal(storage.writes, 1)
      assert.deepEqual(readPracticeStorage(storage), document)
      assert.equal(storage.writes, 1)
    })
  }
  for (const raw of [
    "broken",
    JSON.stringify({ ...createEmptyPracticeDocument(), version: 99 }),
  ]) {
    test(`blocks corrupt or unsupported new documents ${raw.slice(0, 12)}`, () => {
      const storage = new MemoryStorage()
      storage.data.set(PRACTICE_STORAGE_KEY, raw)
      storage.data.set(
        LEGACY_PRACTICE_STORAGE_KEY,
        JSON.stringify(createEmptyPracticeDocument())
      )
      assert.throws(() => readPracticeStorage(storage))
      assert.equal(storage.getItem(PRACTICE_STORAGE_KEY), raw)
      assert.equal(storage.writes, 0)
    })
  }
  test("does not mark migration successful when storage writes fail", () => {
    const storage = new MemoryStorage()
    const raw = JSON.stringify({
      ...createEmptyPracticeDocument(),
      version: 4,
      sessions: [legacySession()],
    })
    storage.data.set(LEGACY_PRACTICE_STORAGE_KEY, raw)
    storage.fail = true
    assert.throws(() => readPracticeStorage(storage), /quota/)
    assert.equal(storage.getItem(PRACTICE_STORAGE_KEY), null)
    assert.equal(storage.getItem(LEGACY_PRACTICE_STORAGE_KEY), raw)
    storage.fail = false
    assert.equal(readPracticeStorage(storage).sessions.length, 1)
  })
  test("rejects unknown exercise kinds instead of trusting arbitrary objects", () => {
    assert.equal(
      validatePracticeDocument({
        ...createEmptyPracticeDocument(),
        savedExercises: [
          { ...createDefaultExercise("construction"), kind: "unknown" },
        ],
      }),
      null
    )
  })
  test("validates complete route snapshots, persisted progress, and tagged evidence", () => {
    const resolved = resolveScaleRoute({
      root: "A",
      scaleId: "pentatonic_minor",
      tuningId: "standard",
      revision: "pentatonic-v1",
      pairId: "neighbor-boxes",
      placementId: "movable",
      routeId: "connection",
      direction: "ascending",
    })
    if (!resolved.ok) throw new Error("route fixture")
    const exercise = createScaleRouteExercise(resolved.value)
    const at = "2026-10-10T00:00:00Z"
    let session: PracticeSession = {
      id: "route-session",
      exercise,
      status: "running",
      startedAt: at,
      updatedAt: at,
      elapsedMs: 0,
      attempts: [],
      route: createScaleRouteProgress(exercise.snapshot),
    }
    const action = {
      id: "answer",
      questionId: session.route!.questionIds[0],
      submissionOrdinal: 1,
      at,
      type: "answer" as const,
      coordinate: { string: 0, fret: 8 },
    }
    session = reduceRouteAction(session, action)
    const document = {
      ...createEmptyPracticeDocument(),
      savedExercises: [exercise],
      sessions: [session],
    }
    assert.equal(
      validatePracticeDocument(document)?.sessions[0].attempts.length,
      1
    )
    const corrupt = structuredClone(document)
    if (corrupt.sessions[0].exercise.kind === "scaleRoute")
      corrupt.sessions[0].exercise.snapshot.occurrences[0].midi++
    assert.equal(validatePracticeDocument(corrupt), null)
    const badProvenance = structuredClone(document)
    badProvenance.sessions[0].attempts[0].responseMs = 1
    assert.equal(validatePracticeDocument(badProvenance), null)
  })

  test("exercise copies do not share nested learning or fret metadata", () => {
    const original = createDefaultExercise("fretboardRecall")
    assert.equal(original.kind, "fretboardRecall")
    if (original.kind !== "fretboardRecall") throw new Error("fixture")
    const saved = clonePracticeExercise(original)
    original.strings[0] = 5
    original.fretRange.min = 3
    assert.equal(saved.strings[0], 0)
    assert.equal(saved.fretRange.min, 0)
  })
})
