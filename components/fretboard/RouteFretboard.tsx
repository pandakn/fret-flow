"use client"

import { useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { INTERVAL_COLORS } from "@/lib/colors"
import type { RouteOccurrence, ScaleRouteSnapshot } from "@/types/note-routes"

type Props = {
  snapshot: ScaleRouteSnapshot
  mode: "study" | "assessment"
  currentOccurrenceId?: string | null
  hintOccurrenceId?: string | null
  onSelect?: (coordinate: { string: number; fret: number }) => void
  label: (key: string, values?: Record<string, string | number>) => string
}

export function RouteFretboard({
  snapshot,
  mode,
  currentOccurrenceId,
  hintOccurrenceId,
  onSelect,
  label,
}: Props) {
  const bounds = useMemo(() => {
    const shapes = snapshot.shapes
    const min = Math.max(
      0,
      Math.min(...shapes.map((shape) => shape.minFret)) - 1
    )
    const max = Math.min(
      21,
      Math.max(...shapes.map((shape) => shape.maxFret)) + 1
    )
    return { min, max }
  }, [snapshot.shapes])
  const occurrences = useMemo(() => {
    const map = new Map<string, RouteOccurrence[]>()
    snapshot.occurrences.forEach((occurrence, index) => {
      const key = `${occurrence.string}-${occurrence.fret}`
      map.set(key, [
        ...(map.get(key) ?? []),
        { ...occurrence, _step: index + 1 } as RouteOccurrence & {
          _step: number
        },
      ])
    })
    return map
  }, [snapshot.occurrences])
  const [focusIndex, setFocusIndex] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const fretCount = bounds.max - bounds.min + 1
  const cells = 6 * fretCount
  const indexFor = (visualString: number, fret: number) =>
    visualString * fretCount + fret - bounds.min
  const moveFocus = (index: number) => {
    const next = Math.max(0, Math.min(cells - 1, index))
    setFocusIndex(next)
    buttons.current[next]?.focus()
  }

  return (
    <div
      className="w-full overflow-x-auto rounded-md border"
      role="region"
      aria-label={label("fretboardRegion")}
    >
      <div className="min-w-max p-2">
        <div
          className="grid"
          style={{ gridTemplateColumns: `48px repeat(${fretCount}, 52px)` }}
        >
          <span aria-hidden="true" />
          {Array.from({ length: fretCount }, (_, offset) => (
            <span
              key={bounds.min + offset}
              className="pb-2 text-center font-mono text-xs text-muted-foreground"
            >
              {bounds.min + offset}
            </span>
          ))}
          {Array.from({ length: 6 }, (_, visualString) => {
            const string = 5 - visualString
            return (
              <div key={string} className="contents">
                <span className="flex h-12 items-center justify-center font-mono text-xs text-muted-foreground">
                  {label("string", { string: 6 - string })}
                </span>
                {Array.from({ length: fretCount }, (_, offset) => {
                  const fret = bounds.min + offset
                  const key = `${string}-${fret}`
                  const steps = occurrences.get(key) ?? []
                  const current = steps.some(
                    (step) => step.id === currentOccurrenceId
                  )
                  const hinted = steps.some(
                    (step) => step.id === hintOccurrenceId
                  )
                  const displaySteps =
                    mode === "study"
                      ? steps
                      : hinted
                        ? steps.filter((step) => step.id === hintOccurrenceId)
                        : []
                  const labelText =
                    mode === "assessment"
                      ? label("candidate", { string: 6 - string, fret })
                      : steps.length
                        ? label("studyCell", {
                            string: 6 - string,
                            fret,
                            note: steps[0].note,
                            interval: steps[0].interval,
                            steps: steps
                              .map(
                                (step) =>
                                  (step as RouteOccurrence & { _step: number })
                                    ._step
                              )
                              .join(", "),
                          })
                        : label("candidate", { string: 6 - string, fret })
                  return (
                    <div
                      key={key}
                      className="flex h-12 items-center justify-center border-b border-dashed border-muted/60"
                    >
                      <button
                        ref={(node) => {
                          if (mode === "assessment")
                            buttons.current[indexFor(visualString, fret)] = node
                        }}
                        type="button"
                        tabIndex={
                          mode === "assessment"
                            ? focusIndex === indexFor(visualString, fret)
                              ? 0
                              : -1
                            : 0
                        }
                        aria-label={labelText}
                        aria-current={current ? "step" : undefined}
                        disabled={mode === "study"}
                        onClick={() => onSelect?.({ string, fret })}
                        onKeyDown={(event) => {
                          if (mode !== "assessment") return
                          const directions: Record<string, number> = {
                            ArrowRight: 1,
                            ArrowLeft: -1,
                            ArrowDown: fretCount,
                            ArrowUp: -fretCount,
                          }
                          const delta = directions[event.key]
                          if (delta !== undefined) {
                            event.preventDefault()
                            moveFocus(indexFor(visualString, fret) + delta)
                          }
                        }}
                        className={cn(
                          "relative flex h-10 min-w-10 items-center justify-center rounded-full border text-center text-xs font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          mode === "assessment" &&
                            "h-11 min-w-11 border-border bg-background hover:border-foreground hover:bg-muted",
                          mode === "study" &&
                            steps.some((step) => step.interval === "R") &&
                            "h-11 min-w-11 border-[var(--color-root)] bg-[var(--color-root)] text-background",
                          mode === "study" &&
                            steps.length > 0 &&
                            !steps.some((step) => step.interval === "R") &&
                            "border-2",
                          current &&
                            "outline outline-4 outline-offset-2 outline-[var(--color-root)]",
                          hinted && "ring-4 ring-[var(--color-root)]"
                        )}
                        style={
                          mode === "study" && steps[0]
                            ? {
                                borderColor: INTERVAL_COLORS[steps[0].interval],
                                color:
                                  steps[0].interval === "R"
                                    ? "var(--background)"
                                    : INTERVAL_COLORS[steps[0].interval],
                              }
                            : undefined
                        }
                      >
                        {mode === "study" && displaySteps.length
                          ? displaySteps
                              .map(
                                (step) =>
                                  (step as RouteOccurrence & { _step: number })
                                    ._step
                              )
                              .join("·")
                          : mode === "assessment" && hinted
                            ? "?"
                            : ""}
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        {mode === "assessment" ? (
          <p className="sr-only">{label("keyboardHelp")}</p>
        ) : null}
      </div>
    </div>
  )
}
