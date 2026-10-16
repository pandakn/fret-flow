"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RouteFretboard } from "@/components/fretboard/RouteFretboard"
import { useScaleRoutePlayback } from "@/components/audio/hooks/useScaleRoutePlayback"
import { resolveScaleRoute } from "@/lib/note-routes"
import {
  createScaleRouteExercise,
  encodeScaleRoutePracticeRequest,
} from "@/lib/scale-route-practice"
import { getScaleRouteDisplayText, routeText } from "@/lib/i18n/note-routes"
import { localePath } from "@/lib/i18n/locales"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import type { NoteName } from "@/types/music"
import type { ScaleRouteSelection } from "@/types/note-routes"
import { cn } from "@/lib/utils"

const DEFAULT_ROUTE = (() => {
  const result = resolveScaleRoute({
    root: "C",
    scaleId: "pentatonic_major",
    tuningId: "standard",
    revision: "pentatonic-v1",
    pairId: "neighbor-boxes",
    placementId: "movable",
    routeId: "connection",
    direction: "ascending",
  })
  if (!result.ok) throw new Error("Built-in guided route catalog is invalid.")
  return result.value
})()

export function ScaleRouteStudy({
  root,
  scaleId,
  onClose,
}: {
  root: NoteName
  scaleId: string
  onClose: () => void
}) {
  const { locale } = useI18n()
  const { saveExercise } = usePracticeStore()
  const [routeId, setRouteId] =
    useState<ScaleRouteSelection["routeId"]>("connection")
  const [direction, setDirection] =
    useState<ScaleRouteSelection["direction"]>("ascending")
  const [bpm, setBpm] = useState(60)
  const [loop, setLoop] = useState(false)
  const selection = useMemo<ScaleRouteSelection>(
    () => ({
      root,
      scaleId: scaleId as ScaleRouteSelection["scaleId"],
      tuningId: "standard",
      revision: "pentatonic-v1",
      pairId: "neighbor-boxes",
      placementId: "movable",
      routeId,
      direction,
    }),
    [direction, root, routeId, scaleId]
  )
  const resolved = resolveScaleRoute(selection)
  const snapshot = resolved.ok ? resolved.value : DEFAULT_ROUTE
  const playback = useScaleRoutePlayback({ snapshot, bpm, loop })
  if (!resolved.ok)
    return (
      <section className="p-6">
        <p role="alert">{resolved.error}</p>
        <Button onClick={onClose}>{routeText(locale, "done")}</Button>
      </section>
    )
  const text = (
    key: Parameters<typeof routeText>[1],
    values?: Record<string, string | number>
  ) => routeText(locale, key, values)
  const display = getScaleRouteDisplayText(snapshot, locale)
  const first = snapshot.occurrences[0]
  const last = snapshot.occurrences.at(-1)!
  const practiceHref = localePath(
    locale,
    `/practice${encodeScaleRoutePracticeRequest(selection)}`
  )
  const exercise = createScaleRouteExercise(snapshot)
  const save = () => saveExercise(exercise)
  const currentStep = playback.currentOccurrenceId
    ? snapshot.occurrences.findIndex(
        (item) => item.id === playback.currentOccurrenceId
      ) + 1
    : 0

  return (
    <main
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-6"
      aria-labelledby="guided-routes-title"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {text("title")}
          </p>
          <h1 id="guided-routes-title" className="mt-2 text-3xl font-semibold">
            {display.name}
          </h1>
          <p className="mt-2 text-muted-foreground">{display.description}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          {text("done")}
        </Button>
      </header>
      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label={text("chooseShape")}
      >
        {(["shape-a", "shape-b", "connection"] as const).map((id) => {
          const key =
            id === "shape-a"
              ? "shapeA"
              : id === "shape-b"
                ? "shapeB"
                : "connection"
          return (
            <Button
              key={id}
              variant={routeId === id ? "default" : "outline"}
              aria-pressed={routeId === id}
              onClick={() => {
                playback.stop()
                setRouteId(id)
              }}
            >
              {text(key)}
            </Button>
          )
        })}
      </section>
      <div className="flex flex-wrap gap-2" aria-label={text("ascending")}>
        {(["ascending", "descending"] as const).map((value) => (
          <Button
            key={value}
            variant={direction === value ? "default" : "outline"}
            aria-pressed={direction === value}
            onClick={() => {
              playback.stop()
              setDirection(value)
            }}
          >
            {text(value)}
          </Button>
        ))}
      </div>
      <section className="grid gap-4 border-y py-4 text-sm sm:grid-cols-3">
        <p>{text("selectPair")}</p>
        <p>
          {text("fretRange", {
            min: Math.min(...snapshot.shapes.map((shape) => shape.minFret)),
            max: Math.max(...snapshot.shapes.map((shape) => shape.maxFret)),
          })}
        </p>
        <p>
          {text("start")}: {text("string", { string: 6 - first.string })} ·{" "}
          {first.note} {text("ending")}:{" "}
          {text("string", { string: 6 - last.string })} · {last.note}
        </p>
      </section>
      <div className="space-y-2">
        <RouteFretboard
          snapshot={snapshot}
          mode="study"
          currentOccurrenceId={playback.currentOccurrenceId}
          label={(key, values) =>
            routeText(locale, key as Parameters<typeof routeText>[1], values)
          }
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {playback.countInBeat
            ? text("countIn", { beat: playback.countInBeat })
            : playback.state === "loading"
              ? text("loading")
              : playback.error
                ? text("audioError")
                : currentStep
                  ? text("step", { step: currentStep })
                  : routeId === "connection"
                    ? text("shiftHint")
                    : ""}
        </p>
      </div>
      {routeId === "connection" ? (
        <p className="border-l-2 border-[var(--color-root)] px-3 text-sm text-muted-foreground">
          {text("sharedExplanation")}
        </p>
      ) : null}
      <section
        className="flex flex-wrap items-center gap-3 border-y py-4"
        aria-label={text("tempo")}
      >
        <Button
          onClick={
            playback.state === "playing" ||
            playback.state === "count-in" ||
            playback.state === "loading"
              ? playback.stop
              : playback.start
          }
        >
          {playback.state === "playing" ||
          playback.state === "count-in" ||
          playback.state === "loading"
            ? text("stop")
            : text("play")}
        </Button>
        <Button variant="outline" onClick={playback.start}>
          {text("restart")}
        </Button>
        <label htmlFor="route-tempo" className="text-sm">
          {text("bpm", { bpm })}
        </label>
        <Slider
          id="route-tempo"
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
          <Switch
            checked={loop}
            onCheckedChange={setLoop}
            aria-label={text("loop")}
          />
          {text("loop")}
        </label>
        {playback.state === "error" ? (
          <Button variant="outline" onClick={playback.start}>
            {text("retryAudio")}
          </Button>
        ) : null}
      </section>
      <div className="flex flex-wrap gap-3">
        <Button onClick={save}>{text("saveRoute")}</Button>
        <Button asChild variant="outline">
          <Link href={practiceHref}>{text("practiceRoute")}</Link>
        </Button>
      </div>
      <ol
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        aria-label={text("routeStudy")}
      >
        {snapshot.occurrences.map((occurrence, index) => {
          const transition = snapshot.transitions.find(
            (item) => item.toId === occurrence.id
          )
          const shift = transition?.shift
          return (
            <li
              key={occurrence.id}
              className={cn(
                "flex items-center gap-3 border p-3 text-sm",
                playback.currentOccurrenceId === occurrence.id &&
                  "border-[var(--color-root)] bg-[var(--color-root)]/10"
              )}
            >
              <span className="font-mono text-muted-foreground">
                {text("step", { step: index + 1 })}
              </span>
              <span className="font-medium">
                {occurrence.note} · {occurrence.interval}
              </span>
              <span>
                {text("string", { string: 6 - occurrence.string })},{" "}
                {text("fretValue", { fret: occurrence.fret })}
              </span>
              {shift ? (
                <span className="text-[var(--color-root)]">
                  {text("shift")}
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </main>
  )
}
