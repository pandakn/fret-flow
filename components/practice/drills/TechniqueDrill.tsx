"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMetronome } from "@/components/practice/hooks/useMetronome"
import { createAttempt } from "@/lib/practice/exercises"
import type { TechniqueExercise } from "@/types/practice"
import type { DrillProps } from "./types"

const LABELS: Record<TechniqueExercise["technique"], string> = {
  "alternate-picking": "Down–up evenly on every note",
  legato: "Keep hammer-ons and pull-offs equal in volume",
  "string-crossing": "Lead each string change with the planned pick stroke",
  "scale-sequence": "Play 1–2–3, 2–3–4 through the scale",
  arpeggio: "Let each note speak without bleeding into the next",
}

export function TechniqueDrill({ exercise, onAttempt, onFinish }: DrillProps<TechniqueExercise>) {
  const metronome = useMetronome({ initialBpm: exercise.bpm, subdivision: 2 })
  const [startedAt, setStartedAt] = useState(() => performance.now())
  const record = (clean: boolean) => {
    onAttempt(createAttempt({
      prompt: LABELS[exercise.technique],
      answer: clean ? "clean" : "missed",
      expected: "clean",
      responseMs: performance.now() - startedAt,
      target: { skill: "technique", key: `${exercise.technique}:${metronome.bpm}` },
      verification: "self-reported",
      bpm: metronome.bpm,
    }))
    setStartedAt(performance.now())
  }
  return (
    <section className="mx-auto max-w-2xl space-y-6 text-center">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">{exercise.technique.replaceAll("-", " ")}</p>
      <h2 className="text-3xl font-semibold">{LABELS[exercise.technique]}</h2>
      <p className="text-muted-foreground">{exercise.root} {exercise.scaleId.replaceAll("_", " ")} · {metronome.bpm} BPM</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={metronome.playing ? metronome.stop : () => void metronome.start()}>{metronome.playing ? "Stop click" : "Start click"}</Button>
        <Button variant="outline" onClick={() => record(false)}>Missed</Button>
        <Button variant="outline" onClick={() => record(true)}>Clean</Button>
        <Button variant="ghost" onClick={onFinish}>Finish</Button>
      </div>
    </section>
  )
}
