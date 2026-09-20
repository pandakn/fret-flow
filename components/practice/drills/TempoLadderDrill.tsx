"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useMetronome } from "@/components/practice/hooks/useMetronome"
import { createAttempt } from "@/lib/practice/exercises"
import { nextTempo } from "@/lib/practice/progression"
import { calculateTapTempo } from "@/lib/practice/metronome"
import type { TempoLadderExercise } from "@/types/practice"
import type { DrillProps } from "./types"

export function TempoLadderDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<TempoLadderExercise>) {
  const metronome = useMetronome({
    initialBpm: exercise.startBpm,
    subdivision: exercise.subdivision,
    initialGapEveryBars: exercise.gapEveryBars,
  })
  const [roundStartedAt, setRoundStartedAt] = useState(() => performance.now())
  const tapsRef = useRef<number[]>([])
  const recentClean = useMemo(
    () => attempts.map((attempt) => attempt.correct),
    [attempts]
  )

  const recordRound = (clean: boolean) => {
    onAttempt(
      createAttempt({
        prompt: `Play ${exercise.repetitionsPerLevel} clean repetitions at ${metronome.bpm} BPM`,
        answer: clean ? "clean" : "missed",
        expected: "clean",
        responseMs: performance.now() - roundStartedAt,
        target: { skill: "tempoLadder", key: `tempo:${metronome.bpm}` },
        verification: "self-reported",
        bpm: metronome.bpm,
      })
    )
    const updated = [...recentClean, clean]
    const next = nextTempo(exercise, metronome.bpm, updated)
    metronome.setBpm(next)
    setRoundStartedAt(performance.now())
    if (clean && metronome.bpm >= exercise.targetBpm) onFinish()
  }

  const tapTempo = () => {
    tapsRef.current = [...tapsRef.current.slice(-5), performance.now()]
    const tappedBpm = calculateTapTempo(tapsRef.current)
    if (tappedBpm !== null) metronome.setBpm(tappedBpm)
  }

  return (
    <section className="mx-auto max-w-2xl space-y-8 text-center">
      <div>
        <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Tempo ladder
        </p>
        <p className="mt-3 font-mono text-7xl font-bold tabular-nums">
          {metronome.bpm}
        </p>
        <p className="text-sm text-muted-foreground">
          {metronome.countingIn ? "Count in · " : "BPM · "}target{" "}
          {exercise.targetBpm}
        </p>
      </div>
      <div className="flex justify-center gap-2" aria-label="Beat indicator">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={
              index === metronome.beat && metronome.playing
                ? "size-3 rounded-full bg-foreground"
                : "size-3 rounded-full bg-muted"
            }
          />
        ))}
      </div>
      <Slider
        min={30}
        max={240}
        value={[metronome.bpm]}
        onValueChange={([value]) => metronome.setBpm(value)}
        aria-label="Tempo"
      />
      <div className="grid gap-4 text-left sm:grid-cols-2">
        <label className="space-y-2 text-xs text-muted-foreground">
          <span>Click volume</span>
          <Slider
            min={0}
            max={100}
            defaultValue={[22]}
            onValueChange={([value]) => metronome.setVolume(value / 100)}
          />
        </label>
        <div className="flex items-end justify-center gap-2 sm:justify-end">
          <Button variant="outline" onClick={tapTempo}>
            Tap tempo
          </Button>
          <Button
            variant={metronome.gapEveryBars > 0 ? "default" : "outline"}
            onClick={() =>
              metronome.setGapEveryBars(metronome.gapEveryBars > 0 ? 0 : 4)
            }
          >
            Gap every 4th bar
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={
            metronome.playing ? metronome.stop : () => void metronome.start()
          }
        >
          {metronome.playing ? "Stop click" : "Start click"}
        </Button>
        <Button variant="outline" onClick={() => recordRound(false)}>
          Missed
        </Button>
        <Button variant="outline" onClick={() => recordRound(true)}>
          Clean round
        </Button>
        <Button variant="ghost" onClick={onFinish}>
          Finish workout
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Play {exercise.repetitionsPerLevel} repetitions. Two clean rounds raise
        the tempo; two misses reduce it.
      </p>
    </section>
  )
}
