import { Check, Circle, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getFretboardPathProgress } from "@/lib/practice/paths"
import { cn } from "@/lib/utils"
import type { PracticeSession } from "@/types/practice"

export function FretboardPathProgress({
  sessions,
}: {
  sessions: readonly PracticeSession[]
}) {
  const progress = getFretboardPathProgress(sessions)
  const { currentStage, currentEvidence } = progress
  const coveragePercent = Math.round(currentEvidence.coverage * 100)
  const targetCoverage = Math.round(currentStage.thresholds.coverage * 100)

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span>
            Stage {currentStage.order}: {currentStage.name}
          </span>
          <span className="font-mono text-xs tabular-nums">
            {coveragePercent}% / {targetCoverage}% coverage
          </span>
        </div>
        <Progress
          value={Math.min(100, (coveragePercent / targetCoverage) * 100)}
          aria-label={`${currentStage.name} target coverage: ${coveragePercent}% of ${targetCoverage}% required`}
        />
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span>{Math.round(currentEvidence.accuracy * 100)}% accuracy</span>
          <span>
            {currentEvidence.sessionCount}/{currentStage.thresholds.sessions}{" "}
            sessions
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="size-3" aria-hidden="true" />
            {progress.dueReviewCount} due for review
          </span>
        </div>
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {progress.stages.map(({ stage, earned }) => {
          const current = stage.id === currentStage.id
          return (
            <li
              key={stage.id}
              className={cn(
                "border p-3",
                current && "border-[var(--color-root)] bg-[var(--color-root)]/5"
              )}
            >
              <div className="flex items-center gap-2">
                {earned ? (
                  <Check
                    className="size-4 text-[var(--color-root)]"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle className="size-4" aria-hidden="true" />
                )}
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  Stage {stage.order}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">{stage.shortName}</p>
              <span className="sr-only">
                {earned ? "Earned" : current ? "Current stage" : "Locked"}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
