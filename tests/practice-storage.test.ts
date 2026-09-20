import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  createEmptyPracticeDocument,
  exportPracticeDocument,
  importPracticeDocument,
  parsePracticeDocument,
  validatePracticeDocument,
} from "../lib/practice/storage"
import { createFretboardPathExercise } from "../lib/practice/paths"

describe("practice storage", () => {
  test("recovers from corrupt data", () => {
    assert.deepEqual(
      parsePracticeDocument("not-json"),
      createEmptyPracticeDocument()
    )
  })

  test("migrates the legacy empty document", () => {
    const migrated = validatePracticeDocument({ version: 0, sessions: [] })
    assert.equal(migrated?.version, 3)
    assert.deepEqual(migrated?.savedExercises, [])
  })

  test("migrates version one without losing sessions", () => {
    const migrated = validatePracticeDocument({
      version: 1,
      savedExercises: [],
      routines: [],
      sessions: [],
    })
    assert.equal(migrated?.version, 3)
    assert.equal(migrated?.dailyChallengeState.wildcardRerolls, 0)
    assert.deepEqual(migrated?.acknowledgedMilestoneIds, [])
  })

  test("migrates version two without losing challenge state", () => {
    const migrated = validatePracticeDocument({
      version: 2,
      savedExercises: [],
      routines: [],
      sessions: [],
      dailyChallengeState: {
        dayKey: "2026-09-20",
        wildcardRerolls: 1,
        wildcardSeed: 4,
      },
      acknowledgedMilestoneIds: ["daily-3"],
    })
    assert.equal(migrated?.version, 3)
    assert.equal(migrated?.dailyChallengeState.wildcardSeed, 4)
    assert.deepEqual(migrated?.acknowledgedMilestoneIds, ["daily-3"])
  })

  test("round-trips path exercise metadata", () => {
    const document = createEmptyPracticeDocument()
    document.savedExercises.push(
      createFretboardPathExercise({
        stageId: "landmarks",
        sessions: [],
        now: new Date("2026-09-20T00:00:00Z"),
      })
    )
    const imported = importPracticeDocument(exportPracticeDocument(document))
    const exercise = imported?.savedExercises[0]
    assert.equal(
      exercise?.kind === "fretboardRecall" ? exercise.path?.stageId : undefined,
      "landmarks"
    )
  })

  test("rejects invalid path metadata in sessions", () => {
    const exercise = createFretboardPathExercise({
      stageId: "landmarks",
      sessions: [],
      now: new Date("2026-09-20T00:00:00Z"),
    })
    const value = {
      ...createEmptyPracticeDocument(),
      sessions: [
        {
          id: "invalid",
          exercise: {
            ...exercise,
            path: { ...exercise.path, stageId: "nope" },
          },
          status: "completed",
          startedAt: exercise.createdAt,
          updatedAt: exercise.createdAt,
          elapsedMs: 0,
          attempts: [],
        },
      ],
    }
    assert.equal(validatePracticeDocument(value), null)
  })
})
