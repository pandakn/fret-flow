import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  FRETBOARD_PATH_STAGES,
  createFretboardPathExercise,
  evaluateFretboardStage,
  getFretboardPathProgress,
} from "../lib/practice/paths"
import type { PracticeAttempt, PracticeSession } from "../types/practice"

const makeSession = (
  checkpoint: boolean,
  targets: (typeof FRETBOARD_PATH_STAGES)[number]["targets"],
  verification: PracticeAttempt["verification"] = "app-verified"
): PracticeSession => {
  const exercise = createFretboardPathExercise({
    stageId: "landmarks",
    sessions: [],
    checkpoint,
    now: new Date(checkpoint ? "2026-09-20T12:00:00Z" : "2026-09-19T12:00:00Z"),
  })
  exercise.path = {
    pathId: "fretboard",
    stageId: "landmarks",
    checkpoint,
    targetIds: targets.map((target) => target.id),
  }
  return {
    id: checkpoint ? "checkpoint" : "review",
    exercise,
    status: "completed",
    startedAt: exercise.createdAt,
    updatedAt: exercise.createdAt,
    completedAt: exercise.createdAt,
    elapsedMs: 60_000,
    attempts: targets.map((target, index) => ({
      id: `${exercise.id}-${index}`,
      prompt: "Name this position",
      answer: target.note,
      expected: target.note,
      correct: true,
      responseMs: 1_000,
      createdAt: exercise.createdAt,
      verification,
      target: {
        skill: "fretboardRecall",
        key: target.id,
        string: target.string,
        fret: target.fret,
        note: target.note,
      },
    })),
  }
}

describe("fretboard mastery path", () => {
  test("defines ordered stages with unique targets", () => {
    assert.deepEqual(
      FRETBOARD_PATH_STAGES.map((stage) => stage.order),
      [1, 2, 3, 4, 5]
    )
    for (const stage of FRETBOARD_PATH_STAGES) {
      assert.equal(
        new Set(stage.targets.map((target) => target.id)).size,
        stage.targets.length
      )
    }
  })

  test("requires verified coverage across sessions and a checkpoint", () => {
    const stage = FRETBOARD_PATH_STAGES[0]
    const split = Math.ceil(stage.targets.length / 2)
    const sessions = [
      makeSession(false, stage.targets.slice(0, split)),
      makeSession(true, stage.targets.slice(split)),
    ]
    const evidence = evaluateFretboardStage(stage, sessions)
    assert.equal(evidence.passed, true)
    assert.equal(evidence.coverage, 1)
    assert.equal(evidence.sessionCount, 2)
  })

  test("does not count self-reported attempts toward mastery", () => {
    const stage = FRETBOARD_PATH_STAGES[0]
    const evidence = evaluateFretboardStage(stage, [
      makeSession(false, stage.targets, "self-reported"),
      makeSession(true, stage.targets, "self-reported"),
    ])
    assert.equal(evidence.eligibleAttempts, 0)
    assert.equal(evidence.passed, false)
  })

  test("keeps an earned stage after long inactivity", () => {
    const stage = FRETBOARD_PATH_STAGES[0]
    const split = Math.ceil(stage.targets.length / 2)
    const sessions = [
      makeSession(false, stage.targets.slice(0, split)),
      makeSession(true, stage.targets.slice(split)),
    ]
    const progress = getFretboardPathProgress(
      sessions,
      new Date("2027-09-20T12:00:00Z")
    )
    assert.deepEqual(progress.earnedStageIds, ["landmarks"])
    assert.ok(progress.dueReviewCount > 0)
  })

  test("does not relock a stage after a later weak review", () => {
    const stage = FRETBOARD_PATH_STAGES[0]
    const split = Math.ceil(stage.targets.length / 2)
    const earnedSessions = [
      makeSession(false, stage.targets.slice(0, split)),
      makeSession(true, stage.targets.slice(split)),
    ]
    const weak = makeSession(false, stage.targets)
    weak.id = "later-weak-review"
    weak.updatedAt = "2026-10-20T12:00:00Z"
    weak.attempts = weak.attempts.map((attempt) => ({
      ...attempt,
      correct: false,
      answer: "wrong",
    }))
    const progress = getFretboardPathProgress([...earnedSessions, weak])
    assert.ok(progress.earnedStageIds.includes("landmarks"))
    assert.equal(progress.stages[0].evidence.passed, false)
  })
})
