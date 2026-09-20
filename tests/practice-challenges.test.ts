import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  buildDailyMissions,
  createDailyChallengeState,
  createSeededRandom,
  isChallengeGoalMet,
  normalizeDailyChallengeState,
} from "../lib/practice/challenges"
import type { SessionSummary } from "../types/practice"
import type { PracticeSession } from "../types/practice"

const summary: SessionSummary = {
  sessionId: "session",
  exerciseKind: "fretboardRecall",
  durationMs: 60_000,
  attemptCount: 10,
  correctCount: 9,
  accuracy: 0.9,
  averageResponseMs: 1_500,
  averageTimingOffsetMs: 40,
  timingVariabilityMs: 60,
  bestBpm: 110,
  comfortableBpm: 105,
  completion: "completed",
}

describe("daily practice challenges", () => {
  test("uses a deterministic random source", () => {
    const first = createSeededRandom("fret-flow")
    const second = createSeededRandom("fret-flow")
    assert.deepEqual(
      [first(), first(), first()],
      [second(), second(), second()]
    )
  })

  test("keeps three distinct missions stable for the day", () => {
    const state = createDailyChallengeState("2026-09-20")
    const first = buildDailyMissions({ sessions: [], state })
    const second = buildDailyMissions({ sessions: [], state })

    assert.deepEqual(first, second)
    assert.equal(first.length, 3)
    assert.equal(new Set(first.map((mission) => mission.exercise.kind)).size, 3)
    assert.deepEqual(
      first.map((mission) => mission.slot),
      ["warmup", "weakSpot", "wildcard"]
    )
  })

  test("rerolls only the wildcard variant", () => {
    const original = createDailyChallengeState("2026-09-20")
    const rerolled = { ...original, wildcardRerolls: 1, wildcardSeed: 1 }
    const first = buildDailyMissions({ sessions: [], state: original })
    const second = buildDailyMissions({ sessions: [], state: rerolled })

    assert.deepEqual(first.slice(0, 2), second.slice(0, 2))
    assert.notEqual(first[2].id, second[2].id)
  })

  test("does not regenerate today's board after a mission session", () => {
    const state = createDailyChallengeState("2026-09-20")
    const first = buildDailyMissions({ sessions: [], state })
    const session: PracticeSession = {
      id: "today",
      exercise: first[1].exercise,
      challenge: {
        id: first[1].id,
        dayKey: first[1].dayKey,
        slot: first[1].slot,
        title: first[1].title,
        goal: first[1].goal,
        modifierLabel: first[1].modifierLabel,
      },
      status: "completed",
      startedAt: "2026-09-20T12:00:00.000Z",
      updatedAt: "2026-09-20T12:01:00.000Z",
      completedAt: "2026-09-20T12:01:00.000Z",
      elapsedMs: 60_000,
      attempts: [],
    }
    const after = buildDailyMissions({ sessions: [session], state })
    assert.deepEqual(after, first)
  })

  test("resets stale daily state", () => {
    const stale = {
      dayKey: "2026-09-19",
      wildcardRerolls: 1,
      wildcardSeed: 1,
    }
    assert.deepEqual(normalizeDailyChallengeState(stale, "2026-09-20"), {
      dayKey: "2026-09-20",
      wildcardRerolls: 0,
      wildcardSeed: 0,
    })
  })

  test("evaluates higher and lower goals in the correct direction", () => {
    assert.equal(
      isChallengeGoalMet(summary, { metric: "accuracy", target: 0.85 }),
      true
    )
    assert.equal(
      isChallengeGoalMet(summary, {
        metric: "timingVariability",
        target: 75,
      }),
      true
    )
    assert.equal(
      isChallengeGoalMet(summary, { metric: "bpm", target: 120 }),
      false
    )
  })
})
