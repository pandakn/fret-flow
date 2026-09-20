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

export function FretboardMasteryPath({
  sessions,
  onStart,
}: {
  sessions: readonly PracticeSession[]
  onStart: (exercise: FretboardRecallExercise) => void
}) {
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
                Fretboard path · Stage {stage.order} of 5
              </p>
            </div>
            <CardTitle className="text-2xl">{stage.name}</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {stage.why}
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span>Target coverage</span>
                <span className="font-mono text-xs tabular-nums">
                  {coveragePercent}% / {targetCoverage}%
                </span>
              </div>
              <Progress
                value={Math.min(100, (coveragePercent / targetCoverage) * 100)}
                aria-label={`${stage.name} target coverage: ${coveragePercent}% of ${targetCoverage}% required`}
              />
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
                <span>{Math.round(evidence.accuracy * 100)}% accuracy</span>
                <span>
                  {evidence.sessionCount}/{stage.thresholds.sessions} sessions
                </span>
                <span>{progress.dueReviewCount} targets due</span>
                {evidence.checkpointCompleted ? (
                  <span className="flex items-center gap-1 text-foreground">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Checkpoint recorded
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </div>
        <div className="flex min-w-64 flex-col justify-center gap-2 border-t bg-muted/20 p-6 lg:border-t-0 lg:border-l">
          <Button onClick={() => start(false)}>
            Continue review
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" onClick={() => start(true)}>
            Check mastery
          </Button>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Checkpoints sample the whole stage without hiding free practice.
          </p>
        </div>
      </div>
    </Card>
  )
}
