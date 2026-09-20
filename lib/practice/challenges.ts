import { CHROMATIC } from "@/lib/notes"
import { SCALES } from "@/lib/scales"
import type {
  ChallengeDifficulty,
  ChallengeGoal,
  ChallengeSlot,
  DailyChallengeState,
  DailyMission,
  ExerciseDefinition,
  ExerciseKind,
  PracticeSession,
  SessionSummary,
} from "@/types/practice"
import { createDefaultExercise } from "./exercises"
import { getComparableSessions, getDifficultyBand } from "./progression"
import { summarizeSession } from "./scoring"
import { getLocalDayKey, getSkillRatings } from "./statistics"

type RandomSource = () => number

const WARMUP_KINDS: ExerciseKind[] = [
  "fretboardRecall",
  "construction",
  "earTraining",
  "chordTransition",
]
const WILDCARD_KINDS: ExerciseKind[] = [
  "rhythm",
  "tempoLadder",
  "technique",
  "positionConnection",
  "chordTransition",
]
const ALL_KINDS: ExerciseKind[] = [
  "fretboardRecall",
  "tempoLadder",
  "technique",
  "chordTransition",
  "earTraining",
  "rhythm",
  "positionConnection",
  "construction",
]

const SLOT_LABELS: Record<ChallengeSlot, string> = {
  warmup: "Tune-up",
  weakSpot: "Weak spot",
  wildcard: "Wildcard",
}

const hashString = (value: string): number => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export const createSeededRandom = (seed: string | number): RandomSource => {
  let state = typeof seed === "number" ? seed >>> 0 : hashString(seed)
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(values: readonly T[], random: RandomSource): T =>
  values[Math.min(values.length - 1, Math.floor(random() * values.length))]

const mostRecentKind = (sessions: readonly PracticeSession[]) =>
  sessions.filter((session) => session.status === "completed").at(-1)?.exercise
    .kind

const getWeakestKind = (sessions: readonly PracticeSession[]): ExerciseKind => {
  const ratings = getSkillRatings(sessions)
  if (ratings.length === 0) return "fretboardRecall"

  const totals = new Map<ExerciseKind, { total: number; count: number }>()
  for (const rating of ratings) {
    const current = totals.get(rating.skill) ?? { total: 0, count: 0 }
    current.total += rating.strength
    current.count += 1
    totals.set(rating.skill, current)
  }
  return (
    ALL_KINDS.map((kind) => {
      const score = totals.get(kind)
      return {
        kind,
        strength: score ? score.total / score.count : -1,
      }
    }).toSorted((left, right) => left.strength - right.strength)[0]?.kind ??
    "fretboardRecall"
  )
}

const getKindForSlot = (
  slot: ChallengeSlot,
  sessions: readonly PracticeSession[],
  used: ReadonlySet<ExerciseKind>,
  random: RandomSource
): ExerciseKind => {
  const weakest = getWeakestKind(sessions)
  const recent = mostRecentKind(sessions)
  const preferred =
    slot === "weakSpot"
      ? [weakest, ...ALL_KINDS]
      : slot === "warmup"
        ? WARMUP_KINDS
        : WILDCARD_KINDS
  const available = preferred.filter(
    (kind, index) =>
      !used.has(kind) && kind !== recent && preferred.indexOf(kind) === index
  )
  const fallback = preferred.filter(
    (kind, index) => !used.has(kind) && preferred.indexOf(kind) === index
  )
  return pick(available.length > 0 ? available : fallback, random)
}

const getDifficulty = (
  slot: ChallengeSlot,
  band: number
): ChallengeDifficulty => {
  if (slot === "warmup") return "steady"
  if (slot === "wildcard" && band > 0) return "bold"
  return band > 0 ? "stretch" : "steady"
}

const makeExercise = (
  kind: ExerciseKind,
  slot: ChallengeSlot,
  dayKey: string,
  band: number,
  random: RandomSource
): { exercise: ExerciseDefinition; modifierLabel: string } => {
  const base = createDefaultExercise(kind)
  const root = pick(CHROMATIC, random)
  const scale = pick(SCALES, random)
  const durationMinutes = slot === "warmup" ? 3 : slot === "weakSpot" ? 5 : 4
  const identity = {
    ...base,
    id: `daily-${dayKey}-${slot}-${kind}`,
    createdAt: `${dayKey}T00:00:00.000Z`,
    durationMinutes,
  }

  switch (kind) {
    case "fretboardRecall": {
      const stringGroups = [
        [0, 1],
        [2, 3],
        [4, 5],
      ]
      const fretWindows = [
        { min: 0, max: 5 },
        { min: 4, max: 9 },
        { min: 7, max: 12 },
      ]
      const strings = pick(stringGroups, random)
      const fretRange = pick(fretWindows, random)
      return {
        exercise: {
          ...identity,
          kind,
          name: `${root} note hunt`,
          description: "Find the target before the board gives it away.",
          recall: band >= 2 ? "interval" : band === 1 ? "root" : "note",
          promptDirection: "findPosition",
          root,
          strings,
          fretRange,
          questionCount: 6 + band * 2,
        },
        modifierLabel: `Strings ${strings.map((value) => value + 1).join(" + ")} · frets ${fretRange.min}–${fretRange.max}`,
      }
    }
    case "tempoLadder": {
      const startBpm = 60 + Math.floor(random() * 5) * 5 + band * 5
      return {
        exercise: {
          ...identity,
          kind,
          name: "Climb the click",
          description: "Bank two clean rounds to move the tempo upward.",
          startBpm,
          targetBpm: startBpm + 10 + band * 5,
          increment: 5,
          repetitionsPerLevel: 2 + band,
          subdivision: pick([1, 2, 3, 4] as const, random),
          gapEveryBars: band > 0 ? 4 : 0,
        },
        modifierLabel: `${startBpm} BPM start · ${band > 0 ? "gap click" : "steady click"}`,
      }
    }
    case "technique": {
      const techniques = [
        "alternate-picking",
        "legato",
        "string-crossing",
        "scale-sequence",
        "arpeggio",
      ] as const
      const technique = pick(techniques, random)
      const bpm = 65 + Math.floor(random() * 4) * 5 + band * 5
      return {
        exercise: {
          ...identity,
          kind,
          name: "Clean streak",
          description: "Build a short run of controlled, repeatable rounds.",
          technique,
          root,
          scaleId: scale.id,
          bpm,
        },
        modifierLabel: `${root} ${scale.name} · ${technique.replaceAll("-", " ")}`,
      }
    }
    case "chordTransition": {
      const pairs = [
        ["C", "G"],
        ["G", "D"],
        ["Am", "F"],
        ["Em", "C"],
        ["D", "A"],
      ] as const
      const [chordA, chordB] = pick(pairs, random)
      return {
        exercise: {
          ...identity,
          kind,
          name: "Chord combo",
          description: "Keep the chain alive with clean, ringing changes.",
          chordA,
          chordB,
          mode: "one-minute",
          voicing: band >= 2 ? "mixed" : "open",
        },
        modifierLabel: `${chordA} ↔ ${chordB} · clean changes only`,
      }
    }
    case "earTraining":
      return {
        exercise: {
          ...identity,
          kind,
          name: "Interval signal",
          description: "Decode a compact set of guitar intervals by ear.",
          category: "interval",
          root,
          questionCount: 6 + band * 2,
        },
        modifierLabel: `${root} reference · ${6 + band * 2} signals`,
      }
    case "rhythm": {
      const patterns = [
        "quarters",
        "eighths",
        "triplets",
        "sixteenths",
        "syncopation",
      ] as const
      const pattern = pick(patterns.slice(0, 3 + band), random)
      const bpm = 65 + Math.floor(random() * 5) * 5 + band * 5
      return {
        exercise: {
          ...identity,
          kind,
          name: "Pulse lock",
          description: "Settle the taps into a tighter rhythmic pocket.",
          pattern,
          bpm,
          bars: 4 + band * 2,
          beatsPerBar: 4,
        },
        modifierLabel: `${pattern} · ${bpm} BPM · ${4 + band * 2} bars`,
      }
    }
    case "positionConnection": {
      const fromPosition = 1 + Math.floor(random() * 3)
      return {
        exercise: {
          ...identity,
          kind,
          name: "Position relay",
          description: "Carry the scale cleanly across a position boundary.",
          root,
          scaleId: scale.id,
          fromPosition,
          toPosition: fromPosition + 1,
        },
        modifierLabel: `${root} ${scale.name} · positions ${fromPosition} → ${fromPosition + 1}`,
      }
    }
    case "construction": {
      return {
        exercise: {
          ...identity,
          kind,
          name: "Theory forge",
          description: "Build the answer before the choices distract you.",
          category: "interval",
          root,
          questionCount: 6 + band * 2,
        },
        modifierLabel: `${root} root · ${6 + band * 2} interval builds`,
      }
    }
  }
}

const getBaselineSummaries = (
  sessions: readonly PracticeSession[],
  exercise: ExerciseDefinition
) => getComparableSessions(sessions, exercise, 3).map(summarizeSession)

const maximum = (values: number[]): number | undefined =>
  values.length > 0 ? Math.max(...values) : undefined

const latest = (values: Array<number | null>): number | undefined =>
  values.toReversed().find((value): value is number => value !== null)

const buildGoal = (
  exercise: ExerciseDefinition,
  sessions: readonly PracticeSession[],
  difficulty: ChallengeDifficulty
): ChallengeGoal => {
  const summaries = getBaselineSummaries(sessions, exercise)
  const lift =
    difficulty === "steady" ? 0 : difficulty === "stretch" ? 0.03 : 0.05

  switch (exercise.kind) {
    case "tempoLadder": {
      const baseline = maximum(
        summaries.flatMap((summary) =>
          summary.bestBpm === null ? [] : [summary.bestBpm]
        )
      )
      return {
        metric: "bpm",
        target:
          baseline === undefined
            ? Math.min(
                exercise.targetBpm,
                exercise.startBpm + exercise.increment
              )
            : Math.min(
                exercise.targetBpm,
                Math.max(exercise.startBpm, baseline + exercise.increment)
              ),
        baseline,
      }
    }
    case "technique": {
      const baseline = maximum(summaries.map((summary) => summary.correctCount))
      return {
        metric: "cleanCount",
        target: Math.max(
          3,
          (baseline ?? 2) + (difficulty === "steady" ? 0 : 1)
        ),
        baseline,
        label: "clean rounds",
      }
    }
    case "chordTransition": {
      const baseline = maximum(summaries.map((summary) => summary.correctCount))
      return {
        metric: "cleanCount",
        target: Math.max(
          8,
          (baseline ?? 7) + (difficulty === "steady" ? 0 : 1)
        ),
        baseline,
        label: "clean changes",
      }
    }
    case "rhythm": {
      const baseline = latest(
        summaries.map((summary) => summary.timingVariabilityMs)
      )
      return {
        metric: "timingVariability",
        target: Math.round(Math.max(45, (baseline ?? 120) * (1 - lift))),
        baseline,
      }
    }
    default: {
      const baseline = latest(summaries.map((summary) => summary.accuracy))
      return {
        metric: "accuracy",
        target: Math.min(0.95, Math.max(0.75, (baseline ?? 0.72) + lift)),
        baseline,
      }
    }
  }
}

const buildMission = (
  slot: ChallengeSlot,
  kind: ExerciseKind,
  dayKey: string,
  sessions: readonly PracticeSession[],
  random: RandomSource,
  variant: number
): DailyMission => {
  const defaultExercise = createDefaultExercise(kind)
  const band = getDifficultyBand(sessions, defaultExercise)
  const difficulty = getDifficulty(slot, band)
  const { exercise, modifierLabel } = makeExercise(
    kind,
    slot,
    dayKey,
    band,
    random
  )
  const title = `${SLOT_LABELS[slot]} · ${exercise.name}`
  const reason =
    slot === "warmup"
      ? "A short confidence-building start before the harder work."
      : slot === "weakSpot"
        ? sessions.length === 0
          ? "Starts a useful baseline for adapting future daily sets."
          : "Selected from your lowest-strength or least-practiced skill."
        : "A contrasting skill and constraint to keep today’s set varied."

  return {
    id: `${dayKey}-${slot}-${kind}-${variant}`,
    dayKey,
    slot,
    title,
    description: exercise.description,
    reason,
    difficulty,
    durationMinutes: exercise.durationMinutes,
    modifierLabel,
    exercise,
    goal: buildGoal(exercise, sessions, difficulty),
  }
}

export const createDailyChallengeState = (
  dayKey = getLocalDayKey(new Date())
): DailyChallengeState => ({
  dayKey,
  wildcardRerolls: 0,
  wildcardSeed: 0,
})

export const normalizeDailyChallengeState = (
  state: DailyChallengeState,
  dayKey: string
): DailyChallengeState =>
  state.dayKey === dayKey ? state : createDailyChallengeState(dayKey)

export const buildDailyMissions = ({
  sessions,
  state,
  dayKey = state.dayKey,
}: {
  sessions: readonly PracticeSession[]
  state: DailyChallengeState
  dayKey?: string
}): DailyMission[] => {
  const normalized = normalizeDailyChallengeState(state, dayKey)
  const priorSessions = sessions.filter(
    (session) => getLocalDayKey(session.startedAt) < dayKey
  )
  const random = createSeededRandom(`${dayKey}:base`)
  const used = new Set<ExerciseKind>()
  const slots: ChallengeSlot[] = ["warmup", "weakSpot", "wildcard"]

  return slots.map((slot) => {
    const slotRandom =
      slot === "wildcard"
        ? createSeededRandom(`${dayKey}:wildcard:${normalized.wildcardSeed}`)
        : random
    const kind = getKindForSlot(slot, priorSessions, used, slotRandom)
    used.add(kind)
    return buildMission(
      slot,
      kind,
      dayKey,
      priorSessions,
      slotRandom,
      slot === "wildcard" ? normalized.wildcardSeed : 0
    )
  })
}

export const getChallengeValue = (
  summary: SessionSummary,
  goal: ChallengeGoal
): number | null => {
  switch (goal.metric) {
    case "accuracy":
      return summary.accuracy
    case "responseTime":
      return summary.averageResponseMs
    case "timingVariability":
      return summary.timingVariabilityMs
    case "cleanCount":
      return summary.correctCount
    case "bpm":
      return summary.bestBpm
  }
}

export const isChallengeGoalMet = (
  summary: SessionSummary,
  goal: ChallengeGoal
): boolean => {
  const value = getChallengeValue(summary, goal)
  if (value === null) return false
  return goal.metric === "responseTime" || goal.metric === "timingVariability"
    ? value <= goal.target
    : value >= goal.target
}

export const getMissionSessions = (
  sessions: readonly PracticeSession[],
  missionId: string
): PracticeSession[] =>
  sessions.filter(
    (session) =>
      session.status === "completed" &&
      session.attempts.length > 0 &&
      session.challenge?.id === missionId
  )

export const getBestMissionSession = (
  sessions: readonly PracticeSession[],
  mission: DailyMission
): PracticeSession | undefined => {
  const matches = getMissionSessions(sessions, mission.id)
  const direction =
    mission.goal.metric === "responseTime" ||
    mission.goal.metric === "timingVariability"
      ? 1
      : -1
  const emptyValue = direction === 1 ? Infinity : -Infinity
  return matches.toSorted((left, right) => {
    const leftValue =
      getChallengeValue(summarizeSession(left), mission.goal) ?? emptyValue
    const rightValue =
      getChallengeValue(summarizeSession(right), mission.goal) ?? emptyValue
    return (leftValue - rightValue) * direction
  })[0]
}

export const formatChallengeValue = (
  value: number,
  metric: ChallengeGoal["metric"],
  cleanCountLabel = "clean rounds"
): string => {
  switch (metric) {
    case "accuracy":
      return `${Math.round(value * 100)}% accuracy`
    case "responseTime":
      return `${(value / 1000).toFixed(1)}s response`
    case "timingVariability":
      return `${Math.round(value)}ms timing spread`
    case "cleanCount":
      return `${Math.round(value)} ${cleanCountLabel}`
    case "bpm":
      return `${Math.round(value)} BPM`
  }
}

export const formatChallengeGoal = (goal: ChallengeGoal): string =>
  `${goal.metric === "responseTime" || goal.metric === "timingVariability" ? "Reach" : "Hit"} ${formatChallengeValue(goal.target, goal.metric, goal.metric === "cleanCount" ? goal.label : undefined)}`
