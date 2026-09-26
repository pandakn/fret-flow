"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { createAttempt } from "@/lib/practice/exercises"
import { getScaleById, getScaleNotes } from "@/lib/scales"
import type { PositionConnectionExercise } from "@/types/practice"
import type { DrillProps } from "./types"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { localizePracticeText, practiceCopy } from "@/lib/i18n/practice-messages"
import { getKeyLabel, spellNoteInKey } from "@/lib/theory/spelling"

export function PositionConnectionDrill({ exercise, attempts, onAttempt, onFinish }: DrillProps<PositionConnectionExercise>) {
  const { locale } = useI18n()
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
  const rootLabel = locale === "th" ? getKeyLabel(exercise.root) : exercise.root
  const noteLabel = (note: typeof notes[number]) =>
    spellNoteInKey(exercise.root, note)
  return (
    <section className="mx-auto max-w-2xl space-y-7 text-center">
      <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {practiceCopy(locale, "Position {from} → {to}", {
          from: exercise.fromPosition,
          to: exercise.toPosition,
        })}
      </p>
      <h2 className="text-3xl font-semibold">
        {practiceCopy(locale, "What comes after {note}?", {
          note: noteLabel(notes[index]),
        })}
      </h2>
      <p className="text-muted-foreground">
        {practiceCopy(locale, "Continue the {root} {scale} sequence across the position boundary.", {
          root: rootLabel,
          scale: localizePracticeText(locale, exercise.scaleId.replaceAll("_", " ")),
        })}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice) => (
          <Button key={choice} variant="outline" onClick={() => choose(choice)}>
            {noteLabel(choice)}
          </Button>
        ))}
      </div>
    </section>
  )
}
