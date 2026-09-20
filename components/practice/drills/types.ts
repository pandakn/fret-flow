import type { PracticeAttempt, PracticeSession } from "@/types/practice"

export type DrillProps<TExercise> = {
  exercise: TExercise
  attempts: PracticeSession["attempts"]
  onAttempt: (attempt: PracticeAttempt) => void
  onFinish: () => void
}
