"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { Button } from "@/components/ui/button"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"
import { createAttempt, generateConstructionPrompt } from "@/lib/practice/exercises"
import { getKeyLabel, spellIntervalNote, spellNoteInKey } from "@/lib/theory/spelling"
import type { ConstructionExercise } from "@/types/practice"
import type { DrillProps } from "./types"

export function ConstructionDrill({
  exercise,
  attempts,
  onAttempt,
  onFinish,
}: DrillProps<ConstructionExercise>) {
  const { locale } = useI18n()
  const [prompt, setPrompt] = useState(() => generateConstructionPrompt(exercise))
  const keyLabel = locale === "th" ? getKeyLabel(exercise.root) : exercise.root
  const startedAt = useRef(0)

  useEffect(() => {
    startedAt.current = performance.now()
  }, [])

  const choose = useCallback(
    (answer: string) => {
      onAttempt(
        createAttempt({
          prompt: prompt.prompt,
          answer,
          expected: prompt.expected,
          responseMs: performance.now() - startedAt.current,
          target: {
            skill: "construction",
            key: `${exercise.root}:${prompt.interval}`,
            note: prompt.expected,
            interval: prompt.interval,
          },
        })
      )

      if (attempts.length + 1 >= exercise.questionCount) {
        onFinish()
      } else {
        setPrompt(generateConstructionPrompt(exercise))
        startedAt.current = performance.now()
      }
    },
    [attempts.length, exercise, onAttempt, onFinish, prompt]
  )

  return (
    <section className="mx-auto max-w-2xl space-y-7 text-center">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {practiceCopy(locale, "Construction · {current}/{total}", {
          current: attempts.length + 1,
          total: exercise.questionCount,
        })}
      </p>
      <h2 className="text-3xl font-semibold">
        {localizePracticeText(locale, prompt.prompt).replace(exercise.root, keyLabel)}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {prompt.choices.map((choice) => (
          <Button key={choice} variant="outline" onClick={() => choose(choice)}>
            {choice === prompt.expected
              ? spellIntervalNote(exercise.root, prompt.interval, choice)
              : spellNoteInKey(exercise.root, choice)}
          </Button>
        ))}
      </div>
    </section>
  )
}
