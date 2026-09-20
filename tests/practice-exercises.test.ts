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
})
