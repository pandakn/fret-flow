import { Check, LockKeyhole } from "lucide-react"
import { getMilestoneProgress } from "@/lib/practice/milestones"
import { cn } from "@/lib/utils"
import type { PracticeSession } from "@/types/practice"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"

const formatProgress = (
  value: number,
  unit: ReturnType<typeof getMilestoneProgress>[number]["unit"],
  locale: "en" | "th"
) => {
  switch (unit) {
    case "percent":
      return `${Math.round(value)}%`
    case "bpm":
      return `${Math.round(value)} BPM`
    case "milliseconds":
      return value === 0 ? practiceCopy(locale, "No timing sample") : `${Math.round(value)}ms`
    case "count":
      return String(Math.round(value))
  }
}

export function MasteryMilestones({
  sessions,
}: {
  sessions: readonly PracticeSession[]
}) {
  const { locale } = useI18n()
  const milestones = getMilestoneProgress(sessions)
  const earned = milestones.filter((milestone) => milestone.earned)
  const next = milestones
    .filter((milestone) => !milestone.earned)
    .map((milestone) => {
      const percent =
        milestone.unit === "milliseconds"
          ? milestone.current === 0
            ? 0
            : (milestone.target / milestone.current) * 100
          : (milestone.current / milestone.target) * 100
      return { milestone, percent: Math.min(99, Math.max(0, percent)) }
    })
    .toSorted((left, right) => right.percent - left.percent)
    .slice(0, 3)

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between border-b pb-3">
        <span className="font-mono text-xs text-muted-foreground">
          {practiceCopy(locale, "Mastery marks")}
        </span>
        <span className="font-mono text-sm font-semibold">
          {earned.length}/{milestones.length}
        </span>
      </div>

      {earned.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {earned.map((milestone) => (
            <li key={milestone.id} className="flex gap-3 border px-3 py-3">
              <Check
                className="mt-0.5 size-4 shrink-0 text-[var(--color-root)]"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium">{milestone.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {milestone.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {practiceCopy(locale, "Your first mastery mark appears when a measured skill crosses its threshold.")}
        </p>
      )}

      {next.length > 0 ? (
        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {practiceCopy(locale, "Closest next")}
          </p>
          <ul className="space-y-4">
            {next.map(({ milestone, percent }) => (
              <li key={milestone.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                    {localizePracticeText(locale, milestone.title)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatProgress(milestone.current, milestone.unit, locale)} /{" "}
                    {formatProgress(milestone.target, milestone.unit, locale)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden bg-muted">
                  <div
                    className={cn("h-full bg-foreground")}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
