"use client"

import { useState } from "react"
import { PracticeHome } from "./PracticeHome"
import { PracticeSession } from "./PracticeSession"
import type { ExerciseDefinition } from "@/types/practice"
import { usePracticeStore } from "./hooks/usePracticeStore"
import { getDueLearningTargets } from "@/lib/learning/review"
import { createDueReviewExercise } from "@/lib/learning/exercises"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { routeText } from "@/lib/i18n/note-routes"

export function LearnPracticeEntry({
  initialExercise,
  reviewRequest,
  invalidRoute = false,
}: {
  initialExercise: ExerciseDefinition | null
  reviewRequest?: { skillId: string; key: string }
  invalidRoute?: boolean
}) {
  const [exercise, setExercise] = useState(initialExercise)
  const { hydrated } = usePracticeStore()
  const { locale } = useI18n()
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
  return (
    <>
      {invalidRoute ? (
        <p role="alert" className="mb-5 border-l-2 border-destructive p-4">
          {routeText(locale, "invalidRoute")}
        </p>
      ) : null}
      <PracticeHome />
    </>
  )
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
