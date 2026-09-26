import { Check, Circle, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getFretboardPathProgress } from "@/lib/practice/paths"
import { cn } from "@/lib/utils"
import type { PracticeSession } from "@/types/practice"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"

export function FretboardPathProgress({
  sessions,
}: {
  sessions: readonly PracticeSession[]
}) {
  const { locale } = useI18n()
  const progress = getFretboardPathProgress(sessions)
  const { currentStage, currentEvidence } = progress
  const coveragePercent = Math.round(currentEvidence.coverage * 100)
  const targetCoverage = Math.round(currentStage.thresholds.coverage * 100)

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span>
            {practiceCopy(locale, "Stage {order}", { order: currentStage.order })}: {localizePracticeText(locale, currentStage.name)}
          </span>
          <span className="font-mono text-xs tabular-nums">
            {coveragePercent}% / {targetCoverage}% {practiceCopy(locale, "coverage")}
          </span>
        </div>
        <Progress
          value={Math.min(100, (coveragePercent / targetCoverage) * 100)}
          aria-label={practiceCopy(locale, "target coverage: {current}% of {target}% required", {
            current: coveragePercent,
            target: targetCoverage,
          })}
        />
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span>{practiceCopy(locale, "{value}% accuracy", { value: Math.round(currentEvidence.accuracy * 100) })}</span>
          <span>
            {practiceCopy(locale, "{current}/{total} sessions", {
              current: currentEvidence.sessionCount,
              total: currentStage.thresholds.sessions,
            })}
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="size-3" aria-hidden="true" />
            {progress.dueReviewCount} {practiceCopy(locale, "due for review")}
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
                  {practiceCopy(locale, "Stage {order}", { order: stage.order })}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">{localizePracticeText(locale, stage.shortName)}</p>
              <span className="sr-only">
                {practiceCopy(locale, earned ? "Earned" : current ? "Current stage" : "Locked")}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
