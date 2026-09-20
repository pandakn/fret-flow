import { createDefaultExercise } from "./exercises"
import type {
  ExerciseDefinition,
  PracticeSession,
  RoutineDefinition,
} from "@/types/practice"

const TEMPLATE_KINDS: ExerciseDefinition["kind"][] = [
  "fretboardRecall",
  "technique",
  "tempoLadder",
  "chordTransition",
  "earTraining",
  "rhythm",
  "construction",
  "positionConnection",
]

export const buildRoutine = (
  durationMinutes: 10 | 20 | 30,
  sessions: readonly PracticeSession[] = [],
  savedExercises: readonly ExerciseDefinition[] = []
): RoutineDefinition => {
  const practiced = new Map<ExerciseDefinition["kind"], number>()
  sessions.forEach((session) => {
    const timestamp = Date.parse(session.updatedAt)
    practiced.set(
      session.exercise.kind,
      Math.max(practiced.get(session.exercise.kind) ?? 0, timestamp)
    )
  })

  const orderedKinds = TEMPLATE_KINDS.toSorted(
    (a, b) => (practiced.get(a) ?? 0) - (practiced.get(b) ?? 0)
  )
  const blockCount = durationMinutes === 10 ? 3 : durationMinutes === 20 ? 4 : 6
  const blockMinutes = Math.floor(durationMinutes / blockCount)
  const blocks = orderedKinds.slice(0, blockCount).map((kind, index) => {
    const saved = savedExercises.find((exercise) => exercise.kind === kind)
    const exercise = saved ?? createDefaultExercise(kind)
    return {
      id: `routine-block-${index}-${exercise.id}`,
      exercise,
      durationMinutes:
        index === blockCount - 1
          ? durationMinutes - blockMinutes * (blockCount - 1)
          : blockMinutes,
    }
  })

  return {
    id: `daily-${durationMinutes}`,
    name: `${durationMinutes}-minute daily practice`,
    description: "A balanced routine weighted toward neglected skills.",
    durationMinutes,
    blocks,
  }
}
