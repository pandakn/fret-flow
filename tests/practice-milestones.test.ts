import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise, createAttempt } from "../lib/practice/exercises"
import {
  getMilestoneProgress,
  getNewMilestones,
} from "../lib/practice/milestones"
import type { PracticeSession } from "../types/practice"

const recallSession = (): PracticeSession => {
  const exercise = createDefaultExercise("fretboardRecall")
  return {
    id: "recall-session",
    exercise,
    status: "completed",
    startedAt: "2026-09-20T12:00:00.000Z",
    updatedAt: "2026-09-20T12:01:00.000Z",
    completedAt: "2026-09-20T12:01:00.000Z",
    elapsedMs: 60_000,
    attempts: Array.from({ length: 10 }, (_, index) =>
      createAttempt({
        prompt: "Find C",
        answer: index === 0 ? "D" : "C",
        expected: "C",
        responseMs: 1_000,
        target: { skill: "fretboardRecall", key: "note:C", note: "C" },
      })
    ),
  }
}

describe("practice milestones", () => {
  test("earns verified milestones from measured sessions", () => {
    const milestones = getMilestoneProgress([recallSession()])
    assert.equal(
      milestones.find((milestone) => milestone.id === "recall-90")?.earned,
      true
    )
  })

  test("does not announce acknowledged milestones again", () => {
    assert.deepEqual(getNewMilestones([recallSession()], ["recall-90"]), [])
  })
})
