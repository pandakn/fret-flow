"use client"

import { useEffect, useState } from "react"
import { Check, Target, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summarizeSession } from "@/lib/practice/scoring"
import { getSessionReflection } from "@/lib/practice/reflection"
import {
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
import { useI18n } from "@/components/i18n/LocaleProvider"
import {
  localizeChallengeGoal,
  localizeChallengeValue,
  localizePracticeText,
  practiceCopy,
} from "@/lib/i18n/practice-messages"

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
  const { locale } = useI18n()
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
      ? practiceCopy(locale, "Continue to next stage")
      : pathMetadata?.checkpoint
        ? practiceCopy(locale, "Review weak targets")
        : practiceCopy(locale, "Back to path")
    : localizePracticeText(locale, doneLabel)

  useEffect(() => {
    if (milestone) acknowledgeMilestone(milestone.id)
  }, [acknowledgeMilestone, milestone])
  const metrics = [
    { label: practiceCopy(locale, "Time"), value: formatDuration(summary.durationMs) },
    { label: practiceCopy(locale, "Accuracy"), value: `${Math.round(summary.accuracy * 100)}%` },
    { label: practiceCopy(locale, "Attempts"), value: String(summary.attemptCount) },
    {
      label: practiceCopy(locale, summary.bestBpm === null ? "Avg response" : "Best clean"),
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
            ? practiceCopy(locale, "Session complete")
            : practiceCopy(locale, "Session ended")}
        </p>
        <CardTitle className="text-3xl">{localizePracticeText(locale, session.exercise.name)}</CardTitle>
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
              {practiceCopy(locale, "Take this into your next session")}
            </h2>
            <p className="text-sm">{localizePracticeText(locale, reflection.observation)}</p>
            <p className="text-sm text-muted-foreground">
              {localizePracticeText(locale, reflection.nextStep)}
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
                  {practiceCopy(locale, goalMet ? "Mission cleared" : "Baseline recorded")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {challengeValue === null
                    ? localizeChallengeGoal(locale, session.challenge.goal)
                    : `${localizeChallengeValue(
                        locale,
                        challengeValue,
                        session.challenge.goal.metric,
                        session.challenge.goal.metric === "cleanCount"
                          ? session.challenge.goal.label
                          : undefined
                      )} · ${localizeChallengeGoal(locale, session.challenge.goal)}`}
                </p>
                {baselineDelta ? (
                  <p className="mt-2 font-mono text-xs text-[var(--color-root)]">
                    {localizePracticeText(locale, baselineDelta)}
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
                ? practiceCopy(locale, "Stage mastered")
                : pathMetadata.checkpoint
                  ? practiceCopy(locale, "Checkpoint recorded")
                  : practiceCopy(locale, "Path evidence updated")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {practiceCopy(locale, "{mastered} mastered · {shaky} shaky · {review} not yet covered", {
                mastered: pathEvidence.masteredTargetIds.length,
                shaky: pathEvidence.shakyTargetIds.length,
                review: pathEvidence.reviewTargetIds.length,
              })}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {practiceCopy(locale, "{value}% coverage", { value: Math.round(pathEvidence.coverage * 100) })} · {practiceCopy(locale, "{value}% accuracy", { value: Math.round(pathEvidence.accuracy * 100) })} · {practiceCopy(locale, "{count} measured sessions", { count: pathEvidence.sessionCount })}
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
              {practiceCopy(locale, "Milestone earned")}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{localizePracticeText(locale, milestone.title)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {localizePracticeText(locale, milestone.description)}
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
