"use client"

import { Button } from "@/components/ui/button"
import { RouteFretboard } from "@/components/fretboard/RouteFretboard"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { getRouteQuestionId } from "@/lib/note-routes"
import { routeText } from "@/lib/i18n/note-routes"
import type { PracticeSession } from "@/types/practice"
import type { ScaleRouteAction } from "@/types/note-routes"
import { ScaleRouteGuitarPractice } from "@/components/practice/ScaleRouteGuitarPractice"

const commandId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export function ScaleRouteDrill({
  session,
  onComplete,
}: {
  session: PracticeSession
  onComplete: () => void
}) {
  const { locale } = useI18n()
  const { dispatchRouteAction } = usePracticeStore()
  if (session.exercise.kind !== "scaleRoute" || !session.route) return null
  const { snapshot } = session.exercise
  const progress = session.route
  const questionId = progress.questionIds[progress.questionIndex] ?? ""
  const transition = snapshot.transitions.find(
    (item) => getRouteQuestionId(snapshot, item.id) === questionId
  )
  const source = transition
    ? snapshot.occurrences.find((item) => item.id === transition.fromId)
    : undefined
  const target = transition
    ? snapshot.occurrences.find((item) => item.id === transition.toId)
    : undefined
  const submit = (action: ScaleRouteAction) =>
    dispatchRouteAction(session.id, action)
  const base = {
    id: commandId(),
    questionId,
    submissionOrdinal: progress.submissionOrdinal,
    at: new Date().toISOString(),
  }
  if (progress.phase === "guitar")
    return (
      <ScaleRouteGuitarPractice session={session} onComplete={onComplete} />
    )
  if (!transition || !source || !target)
    return (
      <p role="alert" className="border p-4">
        {routeText(locale, "invalidRoute")}
      </p>
    )
  const feedback =
    progress.feedback === "exact"
      ? "correct"
      : progress.feedback === "same-pitch"
        ? "samePitch"
        : progress.feedback === "same-note"
          ? "sameNote"
          : progress.feedback === "scale-tone"
            ? "scaleTone"
            : progress.feedback === "outside-scale"
              ? "outsideScale"
              : null
  const hinted = progress.assisted ? target.id : null
  return (
    <section className="space-y-5" aria-labelledby="route-check-title">
      <header className="border-l-2 border-[var(--color-root)] bg-muted/30 p-4">
        <h2 id="route-check-title" className="text-2xl font-semibold">
          {routeText(locale, "routeCheck")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {routeText(locale, "checkIntro")}
        </p>
        <p className="mt-3 font-medium">
          {routeText(locale, "current", {
            string: 6 - source.string,
            fret: source.fret,
          })}
        </p>
        <p className="mt-1 text-sm">{routeText(locale, "findNext")}</p>
      </header>
      <RouteFretboard
        snapshot={snapshot}
        mode="assessment"
        currentOccurrenceId={source.id}
        hintOccurrenceId={hinted}
        label={(key, values) =>
          routeText(locale, key as Parameters<typeof routeText>[1], values)
        }
        onSelect={(coordinate) =>
          submit({ ...base, type: "answer", coordinate })
        }
      />
      <div className="min-h-12" aria-live="polite" role="status">
        {progress.assisted && !progress.answered ? (
          <p className="font-medium">
            {routeText(locale, "hintShown", {
              string: 6 - target.string,
              fret: target.fret,
            })}
          </p>
        ) : null}
        {feedback ? (
          <p
            className={
              progress.answered
                ? "font-semibold text-[var(--color-deg4)]"
                : "text-destructive"
            }
          >
            {routeText(locale, feedback)}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        {!progress.answered ? (
          <Button
            variant="outline"
            disabled={progress.assisted}
            onClick={() => submit({ ...base, id: commandId(), type: "hint" })}
          >
            {routeText(locale, "hint")}
          </Button>
        ) : null}
        {progress.answered ? (
          <Button
            onClick={() => submit({ ...base, id: commandId(), type: "next" })}
          >
            {routeText(locale, "next")}
          </Button>
        ) : null}
      </div>
    </section>
  )
}
