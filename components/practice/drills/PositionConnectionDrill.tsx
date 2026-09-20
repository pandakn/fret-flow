"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { createAttempt } from "@/lib/practice/exercises"
import { getScaleById, getScaleNotes } from "@/lib/scales"
import type { PositionConnectionExercise } from "@/types/practice"
import type { DrillProps } from "./types"

export function PositionConnectionDrill({ exercise, attempts, onAttempt, onFinish }: DrillProps<PositionConnectionExercise>) {
  const startedAt = useRef(0)
  const notes = useMemo(() => {
    const scale = getScaleById(exercise.scaleId)
    return scale ? getScaleNotes(exercise.root, scale.formula) : [exercise.root]
  }, [exercise.root, exercise.scaleId])
  const index = attempts.length % notes.length
  const expected = notes[(index + 1) % notes.length]
  const choices = [expected, ...notes.filter((note) => note !== expected).slice(0, 3)]
  useEffect(() => {
    startedAt.current = performance.now()
  }, [])
  const choose = useCallback((answer: string) => {
    onAttempt(createAttempt({ prompt: `Continue after ${notes[index]}`, answer, expected, responseMs: performance.now() - startedAt.current, target: { skill: "positionConnection", key: `${exercise.scaleId}:${notes[index]}-${expected}` } }))
    startedAt.current = performance.now()
    if (attempts.length + 1 >= 8) onFinish()
  }, [attempts.length, exercise.scaleId, expected, notes, index, onAttempt, onFinish])
  return <section className="mx-auto max-w-2xl space-y-7 text-center"><p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Position {exercise.fromPosition} → {exercise.toPosition}</p><h2 className="text-3xl font-semibold">What comes after {notes[index]}?</h2><p className="text-muted-foreground">Continue the {exercise.root} {exercise.scaleId.replaceAll("_", " ")} sequence across the position boundary.</p><div className="grid grid-cols-2 gap-3">{choices.map((choice) => <Button key={choice} variant="outline" onClick={() => choose(choice)}>{choice}</Button>)}</div></section>
}
