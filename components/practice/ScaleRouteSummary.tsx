"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { getRouteQuestionId } from "@/lib/note-routes"
import { getScaleRouteReport } from "@/lib/practice/scale-route"
import { createScaleRouteExercise } from "@/lib/scale-route-practice"
import { routeText, getScaleRouteDisplayText } from "@/lib/i18n/note-routes"
import type { PracticeSession, ScaleRouteExercise } from "@/types/practice"

export function ScaleRouteSummary({
  session,
  onDone,
  onReplay,
}: {
  session: PracticeSession
  onDone: () => void
  onReplay: (exercise: ScaleRouteExercise) => void
}) {
  const { locale } = useI18n()
  if (session.exercise.kind !== "scaleRoute") return null
  const report = getScaleRouteReport(session)
  const { snapshot } = session.exercise
  const label = (
    key: Parameters<typeof routeText>[1],
    values?: Record<string, string | number>
  ) => routeText(locale, key, values)
  const missed = report.missedTransitionIds.flatMap((transitionId) => {
    const transition = snapshot.transitions.find(
      (item) => item.id === transitionId
    )
    if (!transition) return []
    const from = snapshot.occurrences.find(
      (item) => item.id === transition.fromId
    )
    const to = snapshot.occurrences.find((item) => item.id === transition.toId)
    return from && to ? [{ id: transitionId, from, to }] : []
  })
  const repeatMissed = () =>
    onReplay(
      createScaleRouteExercise(
        snapshot,
        missed.map(({ id }) => {
          const transition = snapshot.transitions.find(
            (item) => item.id === id
          )!
          return getRouteQuestionId(snapshot, transition.id)
        })
      )
    )
  return (
    <Card className="shadow-none" aria-labelledby="route-summary-title">
      <CardHeader>
        <CardTitle id="route-summary-title">{label("summary")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {getScaleRouteDisplayText(snapshot, locale).name}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm">
          {session.status === "completed"
            ? label("routeCheck")
            : label("partial")}
        </p>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="border p-3">
            <dt className="text-sm text-muted-foreground">
              {label("firstAccuracy")}
            </dt>
            <dd className="mt-1 text-2xl font-semibold">
              {report.accuracy === null
                ? label("unavailable")
                : `${Math.round(report.accuracy * 100)}%`}
            </dd>
          </div>
          <div className="border p-3">
            <dt className="text-sm text-muted-foreground">
              {label("assisted")}
            </dt>
            <dd className="mt-1 text-xl font-semibold">
              {report.assistedFirst}
            </dd>
          </div>
          <div className="border p-3">
            <dt className="text-sm text-muted-foreground">
              {label("retries")}
            </dt>
            <dd className="mt-1 text-xl font-semibold">{report.retries}</dd>
          </div>
          <div className="border p-3">
            <dt className="text-sm text-muted-foreground">
              {label("answered")}
            </dt>
            <dd className="mt-1 text-xl font-semibold">
              {report.answeredQuestions} / {report.totalQuestions}
            </dd>
          </div>
        </dl>
        <div>
          <h3 className="font-semibold">{label("missed")}</h3>
          {missed.length ? (
            <ul className="mt-2 space-y-1">
              {missed.map(({ id, from, to }) => (
                <li key={id} className="text-sm">
                  {label("string", { string: 6 - from.string })},{" "}
                  {label("fretValue", { fret: from.fret })} →{" "}
                  {label("string", { string: 6 - to.string })},{" "}
                  {label("fretValue", { fret: to.fret })}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {label("noMisses")}
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {label("participation")}:{" "}
          {report.participation === "tried"
            ? label("practiced")
            : report.participation === "skipped"
              ? label("skipped")
              : label("notReported")}
        </p>
        <div className="flex flex-wrap gap-3">
          {missed.length ? (
            <Button variant="outline" onClick={repeatMissed}>
              {label("repeatMissed")}
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => onReplay(createScaleRouteExercise(snapshot))}
          >
            {label("repeatAll")}
          </Button>
          <Button onClick={onDone}>{label("done")}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
