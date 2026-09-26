"use client"

import { ArrowRight, CheckCircle2, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  createFretboardPathExercise,
  getFretboardPathProgress,
} from "@/lib/practice/paths"
import type { FretboardRecallExercise, PracticeSession } from "@/types/practice"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"

export function FretboardMasteryPath({
  sessions,
  onStart,
}: {
  sessions: readonly PracticeSession[]
  onStart: (exercise: FretboardRecallExercise) => void
}) {
  const { locale } = useI18n()
  const progress = getFretboardPathProgress(sessions)
  const { currentStage: stage, currentEvidence: evidence } = progress
  const coveragePercent = Math.round(evidence.coverage * 100)
  const targetCoverage = Math.round(stage.thresholds.coverage * 100)
  const start = (checkpoint: boolean) =>
    onStart(
      createFretboardPathExercise({
        stageId: stage.id,
        sessions,
        checkpoint,
      })
    )

  return (
    <Card className="overflow-hidden border-[var(--border-2)] shadow-none">
      <div className="grid lg:grid-cols-[1fr_auto]">
        <div>
          <CardHeader>
            <div className="flex items-center gap-2 text-[var(--color-root)]">
              <Map className="size-4" aria-hidden="true" />
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase">
                {practiceCopy(locale, "Fretboard path · Stage {current} of {total}", { current: stage.order, total: 5 })}
              </p>
            </div>
            <CardTitle className="text-2xl">{localizePracticeText(locale, stage.name)}</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {localizePracticeText(locale, stage.why)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span>{practiceCopy(locale, "Target coverage")}</span>
                <span className="font-mono text-xs tabular-nums">
                  {coveragePercent}% / {targetCoverage}%
                </span>
              </div>
              <Progress
                value={Math.min(100, (coveragePercent / targetCoverage) * 100)}
                aria-label={practiceCopy(locale, "target coverage: {current}% of {target}% required", {
                  current: coveragePercent,
                  target: targetCoverage,
                })}
              />
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
                <span>{practiceCopy(locale, "{value}% accuracy", { value: Math.round(evidence.accuracy * 100) })}</span>
                <span>
                  {practiceCopy(locale, "{current}/{total} sessions", {
                    current: evidence.sessionCount,
                    total: stage.thresholds.sessions,
                  })}
                </span>
                <span>{practiceCopy(locale, "{count} targets due", { count: progress.dueReviewCount })}</span>
                {evidence.checkpointCompleted ? (
                  <span className="flex items-center gap-1 text-foreground">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    {practiceCopy(locale, "Checkpoint recorded")}
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </div>
        <div className="flex min-w-64 flex-col justify-center gap-2 border-t bg-muted/20 p-6 lg:border-t-0 lg:border-l">
          <Button onClick={() => start(false)}>
            {practiceCopy(locale, "Continue review")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={() => start(true)}>
            {practiceCopy(locale, "Check mastery")}
          </Button>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {practiceCopy(locale, "Checkpoints sample the whole stage without hiding free practice.")}
          </p>
        </div>
      </div>
    </Card>
  )
}
