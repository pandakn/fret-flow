import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summarizeSession } from "@/lib/practice/scoring"
import type { PracticeSession as PracticeSessionType } from "@/types/practice"

const formatDuration = (milliseconds: number) => {
  const seconds = Math.round(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
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
  const summary = summarizeSession(session)
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
          {summary.completion === "completed" ? "Session complete" : "Session ended"}
        </p>
        <CardTitle className="text-3xl">{session.exercise.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid grid-cols-2 border-y sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-4 text-center sm:border-r last:border-r-0">
              <dt className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{metric.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{metric.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-center">
          <Button onClick={onDone}>{doneLabel}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
