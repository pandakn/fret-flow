import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise } from "../lib/practice/exercises"
import { summarizeSession } from "../lib/practice/scoring"
import type { PracticeSession } from "../types/practice"

describe("practice scoring", () => {
  test("summarizes accuracy, timing, and clean tempo", () => {
    const exercise = createDefaultExercise("tempoLadder")
    const session: PracticeSession = {
      id: "session",
      exercise,
      status: "completed",
      startedAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:01:00.000Z",
      completedAt: "2026-09-20T00:01:00.000Z",
      elapsedMs: 60000,
      attempts: [
        {
          id: "a",
          prompt: "70 BPM",
          answer: "clean",
          expected: "clean",
          correct: true,
          responseMs: 1000,
          createdAt: "2026-09-20T00:00:10.000Z",
          verification: "self-reported",
          target: { skill: "tempoLadder", key: "tempo:70" },
          bpm: 70,
        },
        {
          id: "b",
          prompt: "75 BPM",
          answer: "missed",
          expected: "clean",
          correct: false,
          responseMs: 1500,
          createdAt: "2026-09-20T00:00:20.000Z",
          verification: "self-reported",
          target: { skill: "tempoLadder", key: "tempo:75" },
          bpm: 75,
        },
      ],
    }

    const summary = summarizeSession(session)
    assert.equal(summary.accuracy, 0.5)
    assert.equal(summary.bestBpm, 70)
    assert.equal(summary.completion, "completed")
  })

  test("labels non-completed sessions abandoned", () => {
    const summary = summarizeSession({
      id: "abandoned",
      exercise: createDefaultExercise("technique"),
      status: "abandoned",
      startedAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:00:01.000Z",
      elapsedMs: 1000,
      attempts: [],
    })
    assert.equal(summary.completion, "abandoned")
    assert.equal(summary.accuracy, 0)
  })
})
