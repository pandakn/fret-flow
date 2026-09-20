import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  createDefaultExercise,
  generateConstructionPrompt,
  generateRecallPrompt,
} from "../lib/practice/exercises"

describe("practice exercises", () => {
  test("generates deterministic fretboard prompts", () => {
    const exercise = createDefaultExercise("fretboardRecall")
    if (exercise.kind !== "fretboardRecall") throw new Error("Wrong exercise")

    const prompt = generateRecallPrompt(exercise, () => 0)
    assert.equal(prompt.expected, "C")
    assert.equal(prompt.prompt, "Find every C")
  })

  test("generates construction choices containing the answer", () => {
    const exercise = createDefaultExercise("construction")
    if (exercise.kind !== "construction") throw new Error("Wrong exercise")

    let value = 0
    const prompt = generateConstructionPrompt(exercise, () => {
      value = (value + 0.19) % 1
      return value
    })
    assert.equal(prompt.choices.length, 4)
    assert.ok(prompt.choices.includes(prompt.expected))
  })

  test("generates an explicit position-to-note prompt", () => {
    const exercise = createDefaultExercise("fretboardRecall")
    if (exercise.kind !== "fretboardRecall") throw new Error("Wrong exercise")
    const prompt = generateRecallPrompt(exercise, () => 0.2, [], {
      id: "position-0-1",
      direction: "namePosition",
      string: 0,
      fret: 1,
      note: "F",
    })
    assert.equal(prompt.direction, "namePosition")
    assert.equal(prompt.expected, "F")
    if (prompt.direction !== "namePosition") throw new Error("Wrong direction")
    assert.deepEqual(prompt.position, { string: 0, fret: 1 })
    assert.ok(prompt.choices.includes("F"))
  })

  test("generates a string-scoped note-to-position prompt", () => {
    const exercise = createDefaultExercise("fretboardRecall")
    if (exercise.kind !== "fretboardRecall") throw new Error("Wrong exercise")
    const prompt = generateRecallPrompt(exercise, () => 0, [], {
      id: "find-c-2",
      direction: "findPosition",
      string: 2,
      note: "C",
    })
    assert.equal(prompt.direction, "findPosition")
    assert.equal(prompt.expected, "C")
    if (prompt.direction !== "findPosition") throw new Error("Wrong direction")
    assert.equal(prompt.string, 2)
    assert.match(prompt.prompt, /string 3/)
  })
})
