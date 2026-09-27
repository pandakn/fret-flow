"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createAttempt } from "@/lib/practice/exercises"
import type { ChordTransitionExercise } from "@/types/practice"
import type { DrillProps } from "./types"
import { useI18n } from "@/components/i18n/LocaleProvider"
import {
  localizePracticeText,
  practiceCopy,
} from "@/lib/i18n/practice-messages"
import { learningCopy } from "@/lib/i18n/learning"
import { useMetronome } from "../hooks/useMetronome"

export function ChordTransitionDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<ChordTransitionExercise>) {
  const { locale } = useI18n()
  const [startedAt] = useState(() => performance.now())
  const metronome = useMetronome({ initialBpm: 80, beatsPerBar: 4 })
  const guided = exercise.learning?.origin === "guided-practice"
  const currentChord =
    metronome.bar % 2 === 1 ? exercise.chordA : exercise.chordB
  const nextChord = metronome.bar % 2 === 1 ? exercise.chordB : exercise.chordA
  const record = (clean: boolean) =>
    onAttempt(
      createAttempt({
        prompt: `${exercise.chordA} to ${exercise.chordB}`,
        answer: clean ? "clean" : "missed",
        expected: "clean",
        responseMs: performance.now() - startedAt,
        target: {
          skill: "chordTransition",
          key: `${exercise.chordA}-${exercise.chordB}`,
        },
        verification: "self-reported",
      })
    )
  return (
    <section className="mx-auto max-w-2xl space-y-8 text-center">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {guided
          ? learningCopy[locale].guidedPractice
          : practiceCopy(locale, "One-minute changes")}{" "}
        · {localizePracticeText(locale, exercise.voicing)}
      </p>
      <div className="flex items-center justify-center gap-6 font-mono text-6xl font-bold">
        <span>{exercise.chordA}</span>
        <span className="text-muted-foreground">↔</span>
        <span>{exercise.chordB}</span>
      </div>
      <p className="text-muted-foreground">
        {practiceCopy(
          locale,
          "Count only changes where both chords ring clearly."
        )}
      </p>
      {guided ? (
        <div className="space-y-3 rounded-lg border border-[var(--border-2)] bg-muted/25 p-4">
          <p className="text-sm">{learningCopy[locale].countIn}</p>
          <p className="font-mono text-sm tabular-nums" aria-live="polite">
            {metronome.playing
              ? metronome.countingIn
                ? learningCopy[locale].countInBeat.replace(
                    "{beat}",
                    String(metronome.beat + 1)
                  )
                : learningCopy[locale].changeEveryBar
                    .replace("{chord}", currentChord)
                    .replace("{next}", nextChord)
              : learningCopy[locale].guidedTempo.replace(
                  "{bpm}",
                  String(metronome.bpm)
                )}
          </p>
          {metronome.playing ? (
            <p
              className="font-mono text-xs text-muted-foreground tabular-nums"
              aria-live="off"
            >
              {learningCopy[locale].beatOfBar.replace(
                "{beat}",
                String(metronome.beat + 1)
              )}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={metronome.playing}
              onClick={() => metronome.setBpm(metronome.bpm - 10)}
              aria-label={learningCopy[locale].decreaseTempo}
            >
              −
            </Button>
            <span className="min-w-24 font-mono text-sm tabular-nums">
              {learningCopy[locale].guidedTempo.replace(
                "{bpm}",
                String(metronome.bpm)
              )}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={metronome.playing}
              onClick={() => metronome.setBpm(metronome.bpm + 10)}
              aria-label={learningCopy[locale].increaseTempo}
            >
              +
            </Button>
            <Button
              type="button"
              onClick={
                metronome.playing
                  ? metronome.stop
                  : () => void metronome.start()
              }
            >
              {practiceCopy(
                locale,
                metronome.playing ? "Stop click" : "Start click"
              )}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-20 text-lg"
          onClick={() => record(false)}
        >
          {practiceCopy(locale, "Missed")}
        </Button>
        <Button className="h-20 text-lg" onClick={() => record(true)}>
          {practiceCopy(locale, "Clean change")}
        </Button>
      </div>
      <p className="font-mono text-sm">
        {attempts.filter((attempt) => attempt.correct).length}{" "}
        {practiceCopy(locale, "Clean")} · {attempts.length}{" "}
        {practiceCopy(locale, "total")}
      </p>
      <Button
        variant="ghost"
        onClick={() => {
          metronome.stop()
          onFinish()
        }}
      >
        {practiceCopy(locale, "Finish set")}
      </Button>
    </section>
  )
}
