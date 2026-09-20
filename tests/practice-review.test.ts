import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { buildReviewQueue } from "../lib/practice/review"
import { FRETBOARD_PATH_STAGES } from "../lib/practice/paths"
import { createFretboardPathExercise } from "../lib/practice/paths"
import type { PracticeSession } from "../types/practice"

const missedSession = (targetId: string): PracticeSession => {
  const exercise = createFretboardPathExercise({
    stageId: "landmarks",
    sessions: [],
    now: new Date("2026-09-20T00:00:00Z"),
  })
  return {
    id: "missed",
    exercise,
    status: "completed",
    startedAt: exercise.createdAt,
    updatedAt: exercise.createdAt,
    elapsedMs: 1_000,
    attempts: [
      {
        id: "miss",
        prompt: "Name this note",
        answer: "C",
        expected: "D",
        correct: false,
        responseMs: 8_000,
        createdAt: exercise.createdAt,
        verification: "app-verified",
        target: {
          skill: "fretboardRecall",
          key: targetId,
          string: 0,
          fret: 0,
        },
      },
    ],
  }
}

describe("fretboard review queue", () => {
  test("is deterministic and bounded without history", () => {
    const targets = FRETBOARD_PATH_STAGES[0].targets
    const options = {
      count: 12,
      seed: 42,
      now: new Date("2026-09-20T00:00:00Z"),
    }
    const first = buildReviewQueue(targets, [], options)
    const second = buildReviewQueue(targets, [], options)
    assert.deepEqual(first, second)
    assert.equal(first.length, 12)
    assert.equal(new Set(first.map((target) => target.id)).size, 12)
  })

  test("includes a weak target in the due share", () => {
    const targets = FRETBOARD_PATH_STAGES[0].targets
    const weakId = targets[0].id
    const queue = buildReviewQueue(targets, [missedSession(weakId)], {
      count: 10,
      seed: 7,
      now: new Date("2026-09-20T00:00:00Z"),
    })
    assert.ok(queue.some((target) => target.id === weakId))
  })
})
