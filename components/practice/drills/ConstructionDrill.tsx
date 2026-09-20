"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { createAttempt, generateConstructionPrompt } from "@/lib/practice/exercises"
import type { ConstructionExercise } from "@/types/practice"
import type { DrillProps } from "./types"

export function ConstructionDrill({ exercise, attempts, onAttempt, onFinish }: DrillProps<ConstructionExercise>) {
  const [prompt, setPrompt] = useState(() => generateConstructionPrompt(exercise))
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = performance.now()
  }, [])
  const choose = useCallback((answer: string) => {
    onAttempt(createAttempt({ prompt: prompt.prompt, answer, expected: prompt.expected, responseMs: performance.now() - startedAt.current, target: { skill: "construction", key: `${exercise.root}:${prompt.interval}`, note: prompt.expected, interval: prompt.interval } }))
    if (attempts.length + 1 >= exercise.questionCount) onFinish()
    else { setPrompt(generateConstructionPrompt(exercise)); startedAt.current = performance.now() }
  }, [attempts.length, exercise, onAttempt, onFinish, prompt])
  return <section className="mx-auto max-w-2xl space-y-7 text-center"><p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">Construction · {attempts.length + 1}/{exercise.questionCount}</p><h2 className="text-3xl font-semibold">{prompt.prompt}</h2><div className="grid grid-cols-2 gap-3">{prompt.choices.map((choice) => <Button key={choice} variant="outline" onClick={() => choose(choice)}>{choice}</Button>)}</div></section>
}
