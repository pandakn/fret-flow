import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createDefaultExercise, createAttempt } from "../lib/practice/exercises"
import {
  getMilestoneProgress,
  getNewMilestones,
} from "../lib/practice/milestones"
import type { PracticeSession } from "../types/practice"
import {
  createFretboardPathExercise,
  FRETBOARD_PATH_STAGES,
} from "../lib/practice/paths"

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

  test("earns one durable milestone for the first path stage", () => {
    const stage = FRETBOARD_PATH_STAGES[0]
    const split = Math.ceil(stage.targets.length / 2)
    const sessions = [
      stage.targets.slice(0, split),
      stage.targets.slice(split),
    ].map((targets, sessionIndex): PracticeSession => {
      const checkpoint = sessionIndex === 1
      const exercise = createFretboardPathExercise({
        stageId: "landmarks",
        sessions: [],
        checkpoint,
        now: new Date(`2026-09-${19 + sessionIndex}T12:00:00Z`),
      })
      return {
        id: `path-${sessionIndex}`,
        exercise: {
          ...exercise,
          path: {
            pathId: "fretboard",
            stageId: "landmarks",
            checkpoint,
            targetIds: targets.map((target) => target.id),
          },
        },
        status: "completed",
        startedAt: exercise.createdAt,
        updatedAt: exercise.createdAt,
        elapsedMs: 60_000,
        attempts: targets.map((target, targetIndex) => ({
          id: `path-${sessionIndex}-${targetIndex}`,
          prompt: "Name this note",
          answer: target.note,
          expected: target.note,
          correct: true,
          responseMs: 1_000,
          createdAt: exercise.createdAt,
          verification: "app-verified",
          target: {
            skill: "fretboardRecall",
            key: target.id,
            string: target.string,
            fret: target.fret,
            note: target.note,
          },
        })),
      }
    })
    const milestone = getMilestoneProgress(sessions).find(
      (item) => item.id === "fretboard-path-foundations"
    )
    assert.equal(milestone?.earned, true)
  })
})
