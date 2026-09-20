"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Fretboard } from "@/components/fretboard/Fretboard"
import { useFretboard } from "@/components/fretboard/hooks/useFretboard"
import { createAttempt, generateRecallPrompt } from "@/lib/practice/exercises"
import { getWeakTargets } from "@/lib/practice/progression"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import type { FretboardRecallExercise } from "@/types/practice"
import type { FretNote, TonalPattern } from "@/types/music"
import type { DrillProps } from "./types"

const CHROMATIC_PATTERN: TonalPattern = {
  formula: Array.from({ length: 12 }, () => 1),
  intervals: ["R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
}

export function FretboardRecallDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<FretboardRecallExercise>) {
  const { document } = usePracticeStore()
  const weakTargets = useMemo(
    () => getWeakTargets(document.sessions),
    [document.sessions]
  )
  const [prompt, setPrompt] = useState(() =>
    generateRecallPrompt(exercise, Math.random, weakTargets)
  )
  const [feedback, setFeedback] = useState<{
    key: string
    status: "correct" | "incorrect"
    answer: string
  }>()
  const promptedAtRef = useRef(0)
  const lockedRef = useRef(false)
  const { fretNotesByString, fretCount } = useFretboard({
    root: exercise.root,
    pattern: CHROMATIC_PATTERN,
    tuningId: "standard",
    fretRange: exercise.fretRange,
  })

  useEffect(() => {
    promptedAtRef.current = performance.now()
  }, [])

  const handleAnswer = useCallback(
    (note: FretNote) => {
      if (lockedRef.current || !exercise.strings.includes(note.string)) return
      lockedRef.current = true
      const correct = note.note === prompt.expected
      const attempt = createAttempt({
        prompt: prompt.prompt,
        answer: note.note,
        expected: prompt.expected,
        responseMs: performance.now() - promptedAtRef.current,
        target: {
          ...prompt.target,
          key: `${prompt.target.key}:${note.string}-${note.fret}`,
          string: note.string,
          fret: note.fret,
        },
      })
      onAttempt(attempt)
      setFeedback({
        key: `${note.string}-${note.fret}`,
        status: correct ? "correct" : "incorrect",
        answer: correct ? `Correct — ${note.note}` : `${note.note} is not ${prompt.expected}`,
      })

      window.setTimeout(() => {
        if (attempts.length + 1 >= exercise.questionCount) {
          onFinish()
          return
        }
        setPrompt(generateRecallPrompt(exercise, Math.random, weakTargets))
        setFeedback(undefined)
        promptedAtRef.current = performance.now()
        lockedRef.current = false
      }, 650)
    }, [attempts.length, exercise, onAttempt, onFinish, prompt, weakTargets]
  )

  return (
    <section aria-labelledby="recall-prompt" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Question {Math.min(attempts.length + 1, exercise.questionCount)} / {exercise.questionCount}
          </p>
          <h2 id="recall-prompt" className="mt-1 text-2xl font-semibold">
            {prompt.prompt}
          </h2>
        </div>
        <p aria-live="polite" className="min-h-6 font-mono text-sm">
          {feedback?.answer ?? "Choose a position on the fretboard"}
        </p>
      </div>
      <Fretboard
        fretNotes={fretNotesByString}
        fretCount={fretCount}
        colorPreset="minimal"
        showNoteNames={false}
        quizMode
        quizFeedback={feedback}
        onNoteClick={handleAnswer}
      />
    </section>
  )
}
