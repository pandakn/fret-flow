"use client"

import { useState } from "react"
import { PracticeHome } from "./PracticeHome"
import { PracticeSession } from "./PracticeSession"
import type { ExerciseDefinition } from "@/types/practice"
import { usePracticeStore } from "./hooks/usePracticeStore"
import { getDueLearningTargets } from "@/lib/learning/review"
import { createDueReviewExercise } from "@/lib/learning/exercises"
import { useI18n } from "@/components/i18n/LocaleProvider"

export function LearnPracticeEntry({
  initialExercise,
  reviewRequest,
}: {
  initialExercise: ExerciseDefinition | null
  reviewRequest?: { skillId: string; key: string }
}) {
  const [exercise, setExercise] = useState(initialExercise)
  const { hydrated } = usePracticeStore()
  if (exercise)
    return (
      <PracticeSession exercise={exercise} onExit={() => setExercise(null)} />
    )
  if (reviewRequest && hydrated)
    return (
      <ReviewEntry
        skillId={reviewRequest.skillId}
        targetKey={reviewRequest.key}
      />
    )
  return <PracticeHome />
}

function ReviewEntry({
  skillId,
  targetKey,
}: {
  skillId: string
  targetKey: string
}) {
  const { document } = usePracticeStore()
  const { locale } = useI18n()
  const [exercise, setExercise] = useState(() => {
    const due = getDueLearningTargets(document.sessions).find(
      (target) => target.skillId === skillId && target.key === targetKey
    )
    return due ? createDueReviewExercise(due, locale) : null
  })
  return exercise ? (
    <PracticeSession exercise={exercise} onExit={() => setExercise(null)} />
  ) : (
    <PracticeHome />
  )
}
