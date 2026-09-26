import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise } from "../lib/practice/exercises"
import { getSessionReflection } from "../lib/practice/reflection"
import type { PracticeAttempt, PracticeSession } from "../types/practice"

const attempt = (
  id: string,
  correct: boolean,
  bpm?: number
): PracticeAttempt => ({
  id,
  prompt: "Play the round",
  answer: correct ? "clean" : "missed",
  expected: "clean",
  correct,
  responseMs: 1000,
  createdAt: "2026-09-20T00:00:10.000Z",
  verification: "self-reported",
  target: { skill: "tempoLadder", key: `tempo:${bpm ?? 70}` },
  bpm,
})

describe("session reflection", () => {
  test("recognizes a clean tempo increase for a replayed exercise", () => {
    const exercise = createDefaultExercise("tempoLadder")
    const previous: PracticeSession = {
      id: "previous",
      exercise,
      status: "completed",
      startedAt: "2026-09-19T00:00:00.000Z",
      updatedAt: "2026-09-19T00:01:00.000Z",
      elapsedMs: 60000,
      attempts: [attempt("a", true, 70)],
    }
    const current: PracticeSession = {
      ...previous,
      id: "current",
      startedAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:01:00.000Z",
      attempts: [attempt("b", true, 80)],
    }

    assert.match(
      getSessionReflection(current, [previous, current])?.observation ?? "",
      /rose by 10 BPM/
    )
  })

  test("does not turn an unfinished session into a progress claim", () => {
    const session: PracticeSession = {
      id: "unfinished",
      exercise: createDefaultExercise("tempoLadder"),
      status: "abandoned",
      startedAt: "2026-09-20T00:00:00.000Z",
      updatedAt: "2026-09-20T00:01:00.000Z",
      elapsedMs: 60000,
      attempts: [attempt("a", true, 70)],
    }
    assert.equal(getSessionReflection(session, [session]), null)
  })
})
