"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { useMetronome } from "@/components/practice/hooks/useMetronome"
import { createAttempt } from "@/lib/practice/exercises"
import { getNearestBeatOffset } from "@/lib/practice/metronome"
import type { RhythmExercise } from "@/types/practice"
import type { DrillProps } from "./types"

export function RhythmDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<RhythmExercise>) {
  const subdivision =
    exercise.pattern === "quarters"
      ? 1
      : exercise.pattern === "triplets"
        ? 3
        : exercise.pattern === "sixteenths"
          ? 4
          : 2
  const metronome = useMetronome({
    initialBpm: exercise.bpm,
    subdivision,
    beatsPerBar: exercise.beatsPerBar,
  })
  const startedAtRef = useRef<number | undefined>(undefined)
  const targetTaps = exercise.bars * exercise.beatsPerBar * subdivision
  const start = async () => {
    startedAtRef.current = performance.now() + 50
    await metronome.start()
  }
  const tap = () => {
    if (startedAtRef.current === undefined) return
    const now = performance.now()
    const offset = getNearestBeatOffset(
      now,
      startedAtRef.current,
      metronome.bpm,
      subdivision
    )
    const correct = Math.abs(offset) <= 100
    onAttempt(
      createAttempt({
        prompt: `Tap ${exercise.pattern}`,
        answer: correct ? "on-beat" : "off-beat",
        expected: "on-beat",
        responseMs: now - startedAtRef.current,
        timingOffsetMs: offset,
        target: { skill: "rhythm", key: `${exercise.pattern}:${exercise.bpm}` },
      })
    )
    if (attempts.length + 1 >= targetTaps) {
      metronome.stop()
      onFinish()
    }
  }
  return (
    <section
      className="mx-auto max-w-2xl space-y-7 text-center"
      onKeyDown={(event) => {
        if (event.code === "Space") {
          event.preventDefault()
          tap()
        }
      }}
    >
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {exercise.pattern} · {exercise.bpm} BPM
      </p>
      <h2 className="text-3xl font-semibold">Lock into the pulse</h2>
      <div className="flex justify-center gap-2">
        {Array.from({ length: exercise.beatsPerBar }, (_, index) => (
          <span
            key={index}
            className={
              index === metronome.beat && metronome.playing
                ? "h-2 w-12 rounded-full bg-foreground"
                : "h-2 w-12 rounded-full bg-muted"
            }
          />
        ))}
      </div>
      <div className="flex justify-center gap-3">
        <Button
          onClick={metronome.playing ? metronome.stop : () => void start()}
        >
          {metronome.playing ? "Stop" : "Start"}
        </Button>
        <Button
          variant="outline"
          className="h-20 min-w-48 text-lg"
          onClick={tap}
        >
          Tap · Space
        </Button>
      </div>
      <p className="font-mono text-sm">
        {attempts.length} / {targetTaps} taps
      </p>
      <Button variant="ghost" onClick={onFinish}>
        Finish rhythm test
      </Button>
    </section>
  )
}
