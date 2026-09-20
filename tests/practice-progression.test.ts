import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise } from "../lib/practice/exercises"
import {
  getDifficultyBand,
  getWeakTargets,
  nextTempo,
} from "../lib/practice/progression"
import type { PracticeSession } from "../types/practice"

describe("practice progression", () => {
  test("prioritizes missed targets", () => {
    const exercise = createDefaultExercise("fretboardRecall")
    const session: PracticeSession = {
      id: "s",
      exercise,
      status: "completed",
      startedAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:01:00.000Z",
      elapsedMs: 60000,
      attempts: [
        {
          id: "a",
          prompt: "Find C",
          answer: "D",
          expected: "C",
          correct: false,
          responseMs: 5000,
          createdAt: "2026-09-20T00:00:05.000Z",
          verification: "app-verified",
          target: { skill: "fretboardRecall", key: "note:C", note: "C" },
        },
        {
          id: "b",
          prompt: "Find D",
          answer: "D",
          expected: "D",
          correct: true,
          responseMs: 1000,
          createdAt: "2026-09-20T00:00:10.000Z",
          verification: "app-verified",
          target: { skill: "fretboardRecall", key: "note:D", note: "D" },
        },
      ],
    }
    assert.equal(getWeakTargets([session])[0]?.key, "note:C")
  })

  test("raises and lowers a tempo ladder", () => {
    const exercise = createDefaultExercise("tempoLadder")
    if (exercise.kind !== "tempoLadder") throw new Error("Wrong exercise")
    assert.equal(nextTempo(exercise, 70, [true, true]), 75)
    assert.equal(nextTempo(exercise, 70, [false, false]), 65)
  })

  test("starts conservatively without enough comparable history", () => {
    const exercise = createDefaultExercise("earTraining")
    assert.equal(getDifficultyBand([], exercise), 0)
  })
})
