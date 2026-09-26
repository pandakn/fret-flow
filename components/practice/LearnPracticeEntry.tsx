"use client"

import { useState } from "react"
import { PracticeHome } from "./PracticeHome"
import { PracticeSession } from "./PracticeSession"
import type { ExerciseDefinition } from "@/types/practice"

export function LearnPracticeEntry({
  initialExercise,
}: {
  initialExercise: ExerciseDefinition | null
}) {
  const [exercise, setExercise] = useState(initialExercise)
  return exercise ? (
    <PracticeSession exercise={exercise} onExit={() => setExercise(null)} />
  ) : (
    <PracticeHome />
  )
}
