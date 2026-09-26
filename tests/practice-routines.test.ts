import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise } from "../lib/practice/exercises"
import { buildRoutine } from "../lib/practice/routines"

describe("guided routines", () => {
  test("fills the requested duration with balanced blocks", () => {
    const routine = buildRoutine(20)
    assert.equal(routine.blocks.length, 4)
    assert.equal(
      routine.blocks.reduce((total, block) => total + block.durationMinutes, 0),
      20
    )
    assert.equal(
      new Set(routine.blocks.map((block) => block.exercise.kind)).size,
      4
    )
  })

  test("shuffles supporting skills while keeping the day's focus fixed", () => {
    const focus = createDefaultExercise("technique")
    const initial = buildRoutine(20, [], [], { focusExercise: focus })
    const shuffled = buildRoutine(20, [], [], {
      focusExercise: focus,
      variation: 1,
    })

    assert.equal(initial.blocks[0].exercise, focus)
    assert.equal(shuffled.blocks[0].exercise, focus)
    assert.notDeepEqual(
      initial.blocks.slice(1).map((block) => block.exercise.kind),
      shuffled.blocks.slice(1).map((block) => block.exercise.kind)
    )
    assert.equal(
      new Set(shuffled.blocks.map((block) => block.exercise.kind)).size,
      4
    )
    assert.equal(
      shuffled.blocks.reduce(
        (total, block) => total + block.durationMinutes,
        0
      ),
      20
    )
  })
})
