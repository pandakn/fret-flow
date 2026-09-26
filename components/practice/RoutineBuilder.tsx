"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildDailyMissions } from "@/lib/practice/challenges"
import { buildRoutine } from "@/lib/practice/routines"
import { getLocalDayKey } from "@/lib/practice/statistics"
import { usePracticeStore } from "./hooks/usePracticeStore"
import type { ExerciseDefinition, RoutineDefinition } from "@/types/practice"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"

export function RoutineBuilder({
  onStart,
}: {
  onStart: (routine: RoutineDefinition) => void
}) {
  const { locale } = useI18n()
  const { document, saveRoutine } = usePracticeStore()
  const [duration, setDuration] = useState<10 | 20 | 30>(20)
  const [dayKey, setDayKey] = useState(() => getLocalDayKey(new Date()))
  const [variation, setVariation] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setDayKey(getLocalDayKey(new Date()))
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const focus = useMemo(
    () =>
      buildDailyMissions({
        sessions: document.sessions,
        state: document.dailyChallengeState,
        dayKey,
      }).find((mission) => mission.slot === "weakSpot"),
    [dayKey, document.dailyChallengeState, document.sessions]
  )
  const generated = useMemo(
    () =>
      buildRoutine(duration, document.sessions, document.savedExercises, {
        focusExercise: focus?.exercise,
        variation,
      }),
    [document.savedExercises, document.sessions, duration, focus, variation]
  )
  const [order, setOrder] = useState<ExerciseDefinition["kind"][]>([])
  const blocks = [...generated.blocks].sort((a, b) => {
    const aIndex = order.indexOf(a.exercise.kind)
    const bIndex = order.indexOf(b.exercise.kind)
    return (
      (aIndex === -1 ? generated.blocks.indexOf(a) : aIndex) -
      (bIndex === -1 ? generated.blocks.indexOf(b) : bIndex)
    )
  })
  const routine = { ...generated, blocks }
  const move = (index: number, direction: -1 | 1) => {
    const kinds = blocks.map((block) => block.exercise.kind)
    const target = index + direction
    if (target < 1 || target >= kinds.length) return
    ;[kinds[index], kinds[target]] = [kinds[target], kinds[index]]
    setOrder(kinds)
  }
  return (
    <Card className="border-[var(--border-2)] shadow-none">
      <CardHeader className="flex-row items-end justify-between space-y-0">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            {practiceCopy(locale, "Adaptive routine")}
          </p>
          <CardTitle className="mt-1">{practiceCopy(locale, "Today’s set")}</CardTitle>
        </div>
        <div className="flex gap-1">
          {([10, 20, 30] as const).map((minutes) => (
            <Button
              key={minutes}
              size="xs"
              variant={duration === minutes ? "default" : "ghost"}
              onClick={() => {
                setDuration(minutes)
                setOrder([])
              }}
            >
              {minutes} {practiceCopy(locale, "min")}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {practiceCopy(locale, "Today’s focus:")}{" "}
            <span className="font-medium text-foreground">
              {localizePracticeText(locale, focus?.exercise.name ?? "Fretboard recall")}
            </span>
            {practiceCopy(locale, ". Shuffle the supporting drills to keep this skill in the set.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setVariation((current) => current + 1)
              setOrder([])
            }}
          >
            <Shuffle aria-hidden="true" /> {practiceCopy(locale, "Shuffle set")}
          </Button>
        </div>
        <ol className="divide-y border-y">
          {blocks.map((block, index) => (
            <li key={block.id} className="flex items-center gap-3 py-3">
              <span className="w-6 font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {localizePracticeText(locale, block.exercise.name)}
                  {index === 0 ? (
                    <span className="ml-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      {practiceCopy(locale, "Today’s focus")}
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {block.durationMinutes} {practiceCopy(locale, "min")} · {localizePracticeText(locale, block.exercise.description)}
                </p>
              </div>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={practiceCopy(locale, "Move {name} up", { name: localizePracticeText(locale, block.exercise.name) })}
                disabled={index <= 1}
                onClick={() => move(index, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={practiceCopy(locale, "Move {name} down", { name: localizePracticeText(locale, block.exercise.name) })}
                disabled={index === 0 || index === blocks.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown />
              </Button>
            </li>
          ))}
        </ol>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => saveRoutine(routine)}>
            {practiceCopy(locale, "Save routine")}
          </Button>
          <Button onClick={() => onStart(routine)}>{practiceCopy(locale, "Start routine")}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
