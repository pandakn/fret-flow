"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Fretboard } from "@/components/fretboard/Fretboard"
import { useFretboard } from "@/components/fretboard/hooks/useFretboard"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { Button } from "@/components/ui/button"
import {
  createAttempt,
  generateRecallPrompt,
  type RecallPrompt,
} from "@/lib/practice/exercises"
import { getFretboardPathTarget } from "@/lib/practice/paths"
import { getWeakTargets } from "@/lib/practice/progression"
import type { FretboardRecallExercise } from "@/types/practice"
import type { FretNote, TonalPattern } from "@/types/music"
import type { DrillProps } from "./types"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"
import { spellNoteInKey } from "@/lib/theory/spelling"

const CHROMATIC_PATTERN: TonalPattern = {
  formula: Array.from({ length: 12 }, () => 1),
  intervals: ["R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
}

const createPrompt = (
  exercise: FretboardRecallExercise,
  index: number,
  weakTargets: ReturnType<typeof getWeakTargets>
): RecallPrompt => {
  const targetId = exercise.path?.targetIds[index]
  const target =
    exercise.path && targetId
      ? getFretboardPathTarget(exercise.path.stageId, targetId)
      : undefined
  return generateRecallPrompt(exercise, Math.random, weakTargets, target)
}

export function FretboardRecallDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<FretboardRecallExercise>) {
  const { locale } = useI18n()
  const { document } = usePracticeStore()
  const weakTargets = useMemo(
    () => getWeakTargets(document.sessions),
    [document.sessions]
  )
  const [prompt, setPrompt] = useState(() =>
    createPrompt(exercise, attempts.length, weakTargets)
  )
  const [feedback, setFeedback] = useState<{
    key: string
    status: "correct" | "incorrect"
    answer: string
  }>()
  const promptedAtRef = useRef(0)
  const lockedRef = useRef(false)
  const advanceTimerRef = useRef<number | undefined>(undefined)
  const { fretNotesByString, fretCount, fretStart } = useFretboard({
    root: exercise.root,
    pattern: CHROMATIC_PATTERN,
    tuningId: "standard",
    fretRange: exercise.fretRange,
  })

  useEffect(() => {
    promptedAtRef.current = performance.now()
    return () => {
      if (advanceTimerRef.current !== undefined) {
        window.clearTimeout(advanceTimerRef.current)
      }
    }
  }, [])

  const advance = useCallback(() => {
    advanceTimerRef.current = window.setTimeout(() => {
      if (attempts.length + 1 >= exercise.questionCount) {
        onFinish()
        return
      }
      setPrompt(createPrompt(exercise, attempts.length + 1, weakTargets))
      setFeedback(undefined)
      promptedAtRef.current = performance.now()
      lockedRef.current = false
    }, 650)
  }, [attempts.length, exercise, onFinish, weakTargets])

  const handlePositionAnswer = useCallback(
    (note: FretNote) => {
      if (
        lockedRef.current ||
        prompt.direction !== "findPosition" ||
        !exercise.strings.includes(note.string)
      ) {
        return
      }
      lockedRef.current = true
      const correct =
        note.note === prompt.expected &&
        (prompt.string === undefined || note.string === prompt.string)
      onAttempt(
        createAttempt({
          prompt: prompt.prompt,
          answer: note.note,
          expected: prompt.expected,
          correct,
          responseMs: performance.now() - promptedAtRef.current,
          target: {
            ...prompt.target,
            string: note.string,
            fret: note.fret,
          },
        })
      )
      setFeedback({
        key: `${note.string}-${note.fret}`,
        status: correct ? "correct" : "incorrect",
        answer: correct
          ? `Correct — ${note.note}`
          : `${note.note} is not the requested target`,
      })
      advance()
    },
    [advance, exercise.strings, onAttempt, prompt]
  )

  const handleNameAnswer = useCallback(
    (answer: string) => {
      if (lockedRef.current || prompt.direction !== "namePosition") return
      lockedRef.current = true
      const correct = answer === prompt.expected
      onAttempt(
        createAttempt({
          prompt: prompt.prompt,
          answer,
          expected: prompt.expected,
          responseMs: performance.now() - promptedAtRef.current,
          target: prompt.target,
        })
      )
      setFeedback({
        key: `${prompt.position.string}-${prompt.position.fret}`,
        status: correct ? "correct" : "incorrect",
        answer: correct
          ? `Correct — ${prompt.expected}`
          : `That position is ${prompt.expected}`,
      })
      advance()
    },
    [advance, onAttempt, prompt]
  )

  const questionNumber = Math.min(attempts.length + 1, exercise.questionCount)
  const displayText = (text: string) => {
    const localized = localizePracticeText(locale, text)
    if (locale !== "th") return localized
    return localized.replace(/\b[A-G]#?\b/g, (note) =>
      spellNoteInKey(exercise.root, note as typeof exercise.root)
    )
  }

  return (
    <section aria-labelledby="recall-prompt" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
            {practiceCopy(locale, "Question {current} / {total}", {
              current: questionNumber,
              total: exercise.questionCount,
            })}
          </p>
          <h2 id="recall-prompt" className="mt-1 text-2xl font-semibold">
            {displayText(prompt.prompt)}
          </h2>
        </div>
        <p aria-live="polite" className="min-h-6 font-mono text-sm">
          {feedback
            ? displayText(feedback.answer)
            : practiceCopy(locale, prompt.direction === "namePosition"
                ? "Choose the note name"
                : "Choose a position on the fretboard")}
        </p>
      </div>
      <Fretboard
        fretStart={fretStart}
        fretNotes={fretNotesByString}
        fretCount={fretCount}
        colorPreset="minimal"
        showNoteNames={false}
        quizMode
        quizFeedback={feedback}
        quizTarget={
          prompt.direction === "namePosition" ? prompt.position : undefined
        }
        onNoteClick={handlePositionAnswer}
      />
      {prompt.direction === "namePosition" ? (
        <div
          className="mx-auto grid max-w-2xl grid-cols-3 gap-2 sm:grid-cols-6"
          aria-label={practiceCopy(locale, "Note choices")}
        >
          {prompt.choices.map((choice) => (
            <Button
              key={choice}
              variant="outline"
              disabled={feedback !== undefined}
              onClick={() => handleNameAnswer(choice)}
            >
              {locale === "th" ? spellNoteInKey(exercise.root, choice) : choice}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
