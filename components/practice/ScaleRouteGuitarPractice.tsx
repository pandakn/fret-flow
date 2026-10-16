"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RouteFretboard } from "@/components/fretboard/RouteFretboard"
import { useScaleRoutePlayback } from "@/components/audio/hooks/useScaleRoutePlayback"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { routeText } from "@/lib/i18n/note-routes"
import type { PracticeSession, ScaleRouteExercise } from "@/types/practice"
import type { ScaleRouteAction } from "@/types/note-routes"

const commandId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export function ScaleRouteGuitarPractice({
  session,
  onComplete,
}: {
  session: PracticeSession
  onComplete: () => void
}) {
  if (session.exercise.kind !== "scaleRoute") return null
  return (
    <ScaleRouteGuitarSession
      session={session as PracticeSession & { exercise: ScaleRouteExercise }}
      onComplete={onComplete}
    />
  )
}

function ScaleRouteGuitarSession({
  session,
  onComplete,
}: {
  session: PracticeSession & { exercise: ScaleRouteExercise }
  onComplete: () => void
}) {
  const { locale } = useI18n()
  const { dispatchRouteAction } = usePracticeStore()
  const [bpm, setBpm] = useState(60)
  const [loop, setLoop] = useState(false)
  const playback = useScaleRoutePlayback({
    snapshot: session.exercise.snapshot,
    bpm,
    loop,
  })
  const progress = session.route
  const questionId = progress?.questionIds[progress.questionIndex] ?? ""
  const finish = (status: "tried" | "skipped") => {
    if (!progress) return
    const action: ScaleRouteAction = {
      id: commandId(),
      questionId,
      submissionOrdinal: progress.submissionOrdinal,
      at: new Date().toISOString(),
      type: "participation",
      status,
    }
    dispatchRouteAction(session.id, action)
    playback.stop()
    onComplete()
  }
  const text = (
    key: Parameters<typeof routeText>[1],
    values?: Record<string, string | number>
  ) => routeText(locale, key, values)
  const active =
    playback.state === "loading" ||
    playback.state === "count-in" ||
    playback.state === "playing"
  return (
    <section className="space-y-5" aria-labelledby="route-guitar-title">
      <header>
        <h2 id="route-guitar-title" className="text-2xl font-semibold">
          {text("guitarPractice")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {text("guitarIntro")}
        </p>
      </header>
      <RouteFretboard
        snapshot={session.exercise.snapshot}
        mode="study"
        currentOccurrenceId={playback.currentOccurrenceId}
        label={(key, values) =>
          routeText(locale, key as Parameters<typeof routeText>[1], values)
        }
      />
      <div className="flex flex-wrap items-center gap-3 border-y py-4">
        <Button onClick={active ? playback.stop : playback.start}>
          {active ? text("stop") : text("play")}
        </Button>
        <Button variant="outline" onClick={playback.start}>
          {text("restart")}
        </Button>
        <label htmlFor="guitar-route-tempo" className="text-sm">
          {text("bpm", { bpm })}
        </label>
        <Slider
          id="guitar-route-tempo"
          min={30}
          max={120}
          step={1}
          value={[bpm]}
          onValueChange={(value) => {
            playback.stop()
            setBpm(value[0] ?? 60)
          }}
          className="w-40"
        />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={loop} onCheckedChange={setLoop} />
          {text("loop")}
        </label>
        {playback.state === "error" ? (
          <Button variant="outline" onClick={playback.start}>
            {text("retryAudio")}
          </Button>
        ) : null}
      </div>
      <p className="min-h-6 text-sm text-muted-foreground" aria-live="polite">
        {playback.countInBeat
          ? text("countIn", { beat: playback.countInBeat })
          : playback.state === "loading"
            ? text("loading")
            : playback.error
              ? text("audioError")
              : ""}
      </p>
      <p className="text-sm text-muted-foreground">{text("selfReported")}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => finish("tried")}>{text("practiced")}</Button>
        <Button variant="outline" onClick={() => finish("skipped")}>
          {text("skipped")}
        </Button>
      </div>
    </section>
  )
}
