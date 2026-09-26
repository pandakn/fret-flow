"use client"

import { useEffect, useState } from "react"
import { Check, Target, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summarizeSession } from "@/lib/practice/scoring"
import { getSessionReflection } from "@/lib/practice/reflection"
import {
  formatChallengeGoal,
  formatChallengeValue,
  getChallengeValue,
  isChallengeGoalMet,
} from "@/lib/practice/challenges"
import { getNewMilestones } from "@/lib/practice/milestones"
import {
  evaluateFretboardStage,
  getFretboardPathStage,
} from "@/lib/practice/paths"
import type { PracticeSession as PracticeSessionType } from "@/types/practice"
import { usePracticeStore } from "./hooks/usePracticeStore"

const formatDuration = (milliseconds: number) => {
  const seconds = Math.round(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

const formatBaselineDelta = (
  value: number | null,
  goal: NonNullable<PracticeSessionType["challenge"]>["goal"]
) => {
  if (value === null || goal.baseline === undefined) return null
  const lowerIsBetter =
    goal.metric === "responseTime" || goal.metric === "timingVariability"
  const improvement = lowerIsBetter
    ? goal.baseline - value
    : value - goal.baseline
  if (improvement <= 0) return null
  if (goal.metric === "accuracy") {
    return `+${Math.round(improvement * 100)} points over your recent baseline`
  }
  if (goal.metric === "responseTime" || goal.metric === "timingVariability") {
    return `${Math.round(improvement)}ms tighter than your recent baseline`
  }
  return `+${Math.round(improvement)} over your recent baseline`
}

export function SessionSummary({
  session,
  onDone,
  doneLabel = "Back to practice",
}: {
  session: PracticeSessionType
  onDone: () => void
  doneLabel?: string
}) {
  const { document, acknowledgeMilestone } = usePracticeStore()
  const summary = summarizeSession(session)
  const reflection = getSessionReflection(session, document.sessions)
  const challengeValue = session.challenge
    ? getChallengeValue(summary, session.challenge.goal)
    : null
  const goalMet = session.challenge
    ? isChallengeGoalMet(summary, session.challenge.goal)
    : false
  const baselineDelta = session.challenge
    ? formatBaselineDelta(challengeValue, session.challenge.goal)
    : null
  const [milestone] = useState(
    () =>
      getNewMilestones(document.sessions, document.acknowledgedMilestoneIds)[0]
  )
  const pathMetadata =
    session.exercise.kind === "fretboardRecall"
      ? session.exercise.path
      : undefined
  const pathEvidence = pathMetadata
    ? evaluateFretboardStage(
        getFretboardPathStage(pathMetadata.stageId),
        document.sessions
      )
    : undefined
  const pathDoneLabel = pathEvidence
    ? pathEvidence.passed
      ? "Continue to next stage"
      : pathMetadata?.checkpoint
        ? "Review weak targets"
        : "Back to path"
    : doneLabel

  useEffect(() => {
    if (milestone) acknowledgeMilestone(milestone.id)
  }, [acknowledgeMilestone, milestone])
  const metrics = [
    { label: "Time", value: formatDuration(summary.durationMs) },
    { label: "Accuracy", value: `${Math.round(summary.accuracy * 100)}%` },
    { label: "Attempts", value: String(summary.attemptCount) },
    {
      label: summary.bestBpm === null ? "Avg response" : "Best clean",
      value:
        summary.bestBpm === null
          ? summary.averageResponseMs === null
            ? "—"
            : `${(summary.averageResponseMs / 1000).toFixed(1)}s`
          : `${summary.bestBpm} BPM`,
    },
  ]

  return (
    <Card className="mx-auto max-w-3xl border-[var(--border-2)] shadow-none">
      <CardHeader className="text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {summary.completion === "completed"
            ? "Session complete"
            : "Session ended"}
        </p>
        <CardTitle className="text-3xl">{session.exercise.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid grid-cols-2 border-y sm:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 text-center last:border-r-0 sm:border-r"
            >
              <dt className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                {metric.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
        {reflection ? (
          <section
            className="space-y-2 border-l-2 border-[var(--color-root)] bg-muted/25 px-5 py-4"
            aria-labelledby="practice-reflection-heading"
          >
            <h2 id="practice-reflection-heading" className="font-semibold">
              Take this into your next session
            </h2>
            <p className="text-sm">{reflection.observation}</p>
            <p className="text-sm text-muted-foreground">
              {reflection.nextStep}
            </p>
          </section>
        ) : null}
        {session.challenge ? (
          <section
            className="border-l-2 border-[var(--color-root)] bg-muted/35 px-5 py-4"
            aria-labelledby="mission-result-heading"
          >
            <div className="flex gap-3">
              {goalMet ? (
                <Check className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              ) : (
                <Target className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              )}
              <div>
                <h2 id="mission-result-heading" className="font-semibold">
                  {goalMet ? "Mission cleared" : "Baseline recorded"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {challengeValue === null
                    ? formatChallengeGoal(session.challenge.goal)
                    : `${formatChallengeValue(
                        challengeValue,
                        session.challenge.goal.metric,
                        session.challenge.goal.metric === "cleanCount"
                          ? session.challenge.goal.label
                          : undefined
                      )} · ${formatChallengeGoal(session.challenge.goal)}`}
                </p>
                {baselineDelta ? (
                  <p className="mt-2 font-mono text-xs text-[var(--color-root)]">
                    {baselineDelta}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
        {pathMetadata && pathEvidence ? (
          <section
            className="border-l-2 border-[var(--color-root)] bg-muted/35 px-5 py-4"
            aria-labelledby="path-result-heading"
          >
            <h2 id="path-result-heading" className="font-semibold">
              {pathEvidence.passed
                ? "Stage mastered"
                : pathMetadata.checkpoint
                  ? "Checkpoint recorded"
                  : "Path evidence updated"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pathEvidence.masteredTargetIds.length} mastered ·{" "}
              {pathEvidence.shakyTargetIds.length} shaky ·{" "}
              {pathEvidence.reviewTargetIds.length} not yet covered
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {Math.round(pathEvidence.coverage * 100)}% coverage ·{" "}
              {Math.round(pathEvidence.accuracy * 100)}% accuracy ·{" "}
              {pathEvidence.sessionCount} measured sessions
            </p>
          </section>
        ) : null}
        {milestone ? (
          <section className="border-y py-5 text-center" aria-live="polite">
            <Trophy
              className="mx-auto size-5 text-[var(--color-root)]"
              aria-hidden="true"
            />
            <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Milestone earned
            </p>
            <h2 className="mt-1 text-xl font-semibold">{milestone.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {milestone.description}
            </p>
          </section>
        ) : null}
        <div className="flex justify-center">
          <Button onClick={onDone}>{pathDoneLabel}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
