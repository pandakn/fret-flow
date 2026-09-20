"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGuitarSound } from "@/components/fretboard/hooks/useGuitarSound"
import { createAttempt } from "@/lib/practice/exercises"
import type { EarTrainingExercise } from "@/types/practice"
import type { IntervalName } from "@/types/music"
import type { DrillProps } from "./types"
import { CHROMATIC } from "@/lib/notes"

const CHOICES: { label: string; interval: IntervalName; semitones: number }[] =
  [
    { label: "Minor 2nd", interval: "b2", semitones: 1 },
    { label: "Major 2nd", interval: "2", semitones: 2 },
    { label: "Minor 3rd", interval: "b3", semitones: 3 },
    { label: "Major 3rd", interval: "3", semitones: 4 },
    { label: "Perfect 4th", interval: "4", semitones: 5 },
    { label: "Perfect 5th", interval: "5", semitones: 7 },
  ]

export function EarTrainingDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<EarTrainingExercise>) {
  const { playNote } = useGuitarSound()
  const [answerIndex, setAnswerIndex] = useState(() =>
    Math.floor(Math.random() * CHOICES.length)
  )
  const promptedAt = useRef(0)
  const answer = CHOICES[answerIndex]
  useEffect(() => {
    promptedAt.current = performance.now()
  }, [])
  const play = async () => {
    const rootFrequency = 261.63 * 2 ** (CHROMATIC.indexOf(exercise.root) / 12)
    await playNote(rootFrequency)
    window.setTimeout(
      () => void playNote(rootFrequency * 2 ** (answer.semitones / 12)),
      650
    )
  }
  const choose = useCallback(
    (choice: (typeof CHOICES)[number]) => {
      onAttempt(
        createAttempt({
          prompt: "Name the interval",
          answer: choice.interval,
          expected: answer.interval,
          responseMs: performance.now() - promptedAt.current,
          target: {
            skill: "earTraining",
            key: `interval:${answer.interval}`,
            interval: answer.interval,
          },
        })
      )
      if (attempts.length + 1 >= exercise.questionCount) onFinish()
      else {
        setAnswerIndex((index) => {
          const offset = 1 + Math.floor(Math.random() * (CHOICES.length - 1))
          return (index + offset) % CHOICES.length
        })
        promptedAt.current = performance.now()
      }
    },
    [
      answer.interval,
      attempts.length,
      exercise.questionCount,
      onAttempt,
      onFinish,
    ]
  )
  return (
    <section className="mx-auto max-w-2xl space-y-7 text-center">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Ear training · {attempts.length + 1}/{exercise.questionCount}
      </p>
      <h2 className="text-3xl font-semibold">What interval do you hear?</h2>
      <p className="text-sm text-muted-foreground">
        Reference root: {exercise.root}
      </p>
      <Button onClick={() => void play()}>Play interval</Button>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CHOICES.map((choice) => (
          <Button
            key={choice.interval}
            variant="outline"
            onClick={() => choose(choice)}
          >
            {choice.label}
          </Button>
        ))}
      </div>
    </section>
  )
}
