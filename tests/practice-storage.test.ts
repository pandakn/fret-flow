import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  createEmptyPracticeDocument,
  parsePracticeDocument,
  validatePracticeDocument,
} from "../lib/practice/storage"

describe("practice storage", () => {
  test("recovers from corrupt data", () => {
    assert.deepEqual(parsePracticeDocument("not-json"), createEmptyPracticeDocument())
  })

  test("migrates the legacy empty document", () => {
    const migrated = validatePracticeDocument({ version: 0, sessions: [] })
    assert.equal(migrated?.version, 1)
    assert.deepEqual(migrated?.savedExercises, [])
  })
})
