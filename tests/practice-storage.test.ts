import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  createEmptyPracticeDocument,
  parsePracticeDocument,
  validatePracticeDocument,
} from "../lib/practice/storage"

describe("practice storage", () => {
  test("recovers from corrupt data", () => {
    assert.deepEqual(
      parsePracticeDocument("not-json"),
      createEmptyPracticeDocument()
    )
  })

  test("migrates the legacy empty document", () => {
    const migrated = validatePracticeDocument({ version: 0, sessions: [] })
    assert.equal(migrated?.version, 2)
    assert.deepEqual(migrated?.savedExercises, [])
  })

  test("migrates version one without losing sessions", () => {
    const migrated = validatePracticeDocument({
      version: 1,
      savedExercises: [],
      routines: [],
      sessions: [],
    })
    assert.equal(migrated?.version, 2)
    assert.equal(migrated?.dailyChallengeState.wildcardRerolls, 0)
    assert.deepEqual(migrated?.acknowledgedMilestoneIds, [])
  })
})
