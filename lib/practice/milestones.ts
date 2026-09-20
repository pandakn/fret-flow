import type {
  ExerciseKind,
  MilestoneProgress,
  PracticeSession,
} from "@/types/practice"
import { summarizeSession } from "./scoring"
import { getFretboardPathProgress } from "./paths"

const completed = (sessions: readonly PracticeSession[]) =>
  sessions.filter((session) => session.status === "completed")

const verifiedSummaries = (
  sessions: readonly PracticeSession[],
  kind: ExerciseKind
) =>
  completed(sessions)
    .filter(
      (session) =>
        session.exercise.kind === kind &&
        session.attempts.length > 0 &&
        session.attempts.every(
          (attempt) => attempt.verification === "app-verified"
        )
    )
    .map(summarizeSession)

const maxOrZero = (values: number[]) =>
  values.length === 0 ? 0 : Math.max(...values)

export const getMilestoneProgress = (
  sessions: readonly PracticeSession[]
): MilestoneProgress[] => {
  const done = completed(sessions)
  const recall = verifiedSummaries(done, "fretboardRecall")
  const ear = verifiedSummaries(done, "earTraining")
  const rhythm = verifiedSummaries(done, "rhythm")
  const dailyDays = new Set(
    done.flatMap((session) =>
      session.challenge && session.attempts.length > 0
        ? [session.challenge.dayKey]
        : []
    )
  ).size
  const cleanChordChanges = maxOrZero(
    done
      .filter((session) => session.exercise.kind === "chordTransition")
      .map((session) => summarizeSession(session).correctCount)
  )
  const bestBpm = maxOrZero(
    done.flatMap((session) => {
      const bpm = summarizeSession(session).bestBpm
      return bpm === null ? [] : [bpm]
    })
  )
  const fretboardPath = getFretboardPathProgress(done)

  const definitions: MilestoneProgress[] = [
    {
      id: "fretboard-path-foundations",
      title: "Fretboard foundations",
      description: "Master the landmark-notes stage with verified recall.",
      skill: "fretboardRecall",
      current: fretboardPath.earnedStageIds.includes("landmarks") ? 1 : 0,
      target: 1,
      unit: "count",
      earned: false,
      verifiedOnly: true,
    },
    {
      id: "recall-90",
      title: "Clear coordinates",
      description: "Reach 90% in an app-verified fretboard recall session.",
      skill: "fretboardRecall",
      current: Math.round(
        maxOrZero(recall.map((summary) => summary.accuracy)) * 100
      ),
      target: 90,
      unit: "percent",
      earned: false,
      verifiedOnly: true,
    },
    {
      id: "ear-85",
      title: "Open ears",
      description: "Reach 85% in an app-verified ear training session.",
      skill: "earTraining",
      current: Math.round(
        maxOrZero(ear.map((summary) => summary.accuracy)) * 100
      ),
      target: 85,
      unit: "percent",
      earned: false,
      verifiedOnly: true,
    },
    {
      id: "rhythm-75",
      title: "In the pocket",
      description: "Reduce app-verified timing spread to 75ms or less.",
      skill: "rhythm",
      current:
        rhythm.length === 0
          ? 0
          : Math.min(
              ...rhythm.flatMap((summary) =>
                summary.timingVariabilityMs === null
                  ? []
                  : [summary.timingVariabilityMs]
              ),
              250
            ),
      target: 75,
      unit: "milliseconds",
      earned: false,
      verifiedOnly: true,
    },
    {
      id: "chords-20",
      title: "Clean handoff",
      description: "Record 20 clean chord changes in one session.",
      skill: "chordTransition",
      current: cleanChordChanges,
      target: 20,
      unit: "count",
      earned: false,
      verifiedOnly: false,
    },
    {
      id: "tempo-120",
      title: "Triple digits",
      description: "Complete a clean round at 120 BPM.",
      skill: "tempoLadder",
      current: bestBpm,
      target: 120,
      unit: "bpm",
      earned: false,
      verifiedOnly: false,
    },
    {
      id: "daily-3",
      title: "Three discoveries",
      description: "Complete daily missions on three different days.",
      current: dailyDays,
      target: 3,
      unit: "count",
      earned: false,
      verifiedOnly: false,
    },
  ]

  return definitions.map((milestone) => ({
    ...milestone,
    earned:
      milestone.id === "rhythm-75"
        ? milestone.current > 0 && milestone.current <= milestone.target
        : milestone.current >= milestone.target,
  }))
}

export const getNewMilestones = (
  sessions: readonly PracticeSession[],
  acknowledgedIds: readonly string[]
): MilestoneProgress[] => {
  const acknowledged = new Set(acknowledgedIds)
  return getMilestoneProgress(sessions).filter(
    (milestone) => milestone.earned && !acknowledged.has(milestone.id)
  )
}
