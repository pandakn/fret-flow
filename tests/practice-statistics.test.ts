import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise } from "../lib/practice/exercises"
import {
  getCurrentStreak,
  getPracticeMinutes,
} from "../lib/practice/statistics"
import type { PracticeSession } from "../types/practice"

const makeSession = (date: string): PracticeSession => ({
  id: date,
  exercise: createDefaultExercise("technique"),
  status: "completed",
  startedAt: `${date}T12:00:00.000Z`,
  updatedAt: `${date}T12:10:00.000Z`,
  completedAt: `${date}T12:10:00.000Z`,
  elapsedMs: 600000,
  attempts: [],
})

describe("practice statistics", () => {
  test("calculates minutes and a current streak", () => {
    const sessions = [makeSession("2026-09-19"), makeSession("2026-09-20")]
    assert.equal(getPracticeMinutes(sessions), 20)
    assert.equal(getCurrentStreak(sessions, new Date("2026-09-20T18:00:00.000Z")), 2)
  })
})
