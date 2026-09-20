import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { buildRoutine } from "../lib/practice/routines"

describe("guided routines", () => {
  test("fills the requested duration with balanced blocks", () => {
    const routine = buildRoutine(20)
    assert.equal(routine.blocks.length, 4)
    assert.equal(
      routine.blocks.reduce((total, block) => total + block.durationMinutes, 0),
      20
    )
    assert.equal(new Set(routine.blocks.map((block) => block.exercise.kind)).size, 4)
  })
})
