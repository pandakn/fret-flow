"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createAttempt } from "@/lib/practice/exercises"
import type { ChordTransitionExercise } from "@/types/practice"
import type { DrillProps } from "./types"

export function ChordTransitionDrill({ exercise, attempts, onAttempt, onFinish }: DrillProps<ChordTransitionExercise>) {
  const [startedAt] = useState(() => performance.now())
  const record = (clean: boolean) => onAttempt(createAttempt({
    prompt: `${exercise.chordA} to ${exercise.chordB}`,
    answer: clean ? "clean" : "missed",
    expected: "clean",
    responseMs: performance.now() - startedAt,
    target: { skill: "chordTransition", key: `${exercise.chordA}-${exercise.chordB}` },
    verification: "self-reported",
  }))
  return (
    <section className="mx-auto max-w-2xl space-y-8 text-center">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">One-minute changes · {exercise.voicing}</p>
      <div className="flex items-center justify-center gap-6 font-mono text-6xl font-bold">
        <span>{exercise.chordA}</span><span className="text-muted-foreground">↔</span><span>{exercise.chordB}</span>
      </div>
      <p className="text-muted-foreground">Count only changes where both chords ring clearly.</p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-20 text-lg" onClick={() => record(false)}>Missed</Button>
        <Button className="h-20 text-lg" onClick={() => record(true)}>Clean change</Button>
      </div>
      <p className="font-mono text-sm">{attempts.filter((attempt) => attempt.correct).length} clean · {attempts.length} total</p>
      <Button variant="ghost" onClick={onFinish}>Finish set</Button>
    </section>
  )
}
