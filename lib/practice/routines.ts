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
  savedExercises: readonly ExerciseDefinition[] = [],
  options: { focusExercise?: ExerciseDefinition; variation?: number } = {}
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
  const focusKind = options.focusExercise?.kind
  const supportingKinds = orderedKinds.filter((kind) => kind !== focusKind)
  const variation = Math.max(0, Math.trunc(options.variation ?? 0))
  const offset = variation % supportingKinds.length
  const rotatedKinds = [
    ...supportingKinds.slice(offset),
    ...supportingKinds.slice(0, offset),
  ]
  const selectedKinds = focusKind
    ? [focusKind, ...rotatedKinds.slice(0, blockCount - 1)]
    : rotatedKinds.slice(0, blockCount)
  const blocks = selectedKinds.map((kind, index) => {
    const saved = savedExercises.find((exercise) => exercise.kind === kind)
    const exercise =
      kind === focusKind
        ? options.focusExercise!
        : (saved ?? createDefaultExercise(kind))
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
    description: focusKind
      ? "Today’s focus, with a changing mix of supporting skills."
      : "A balanced routine weighted toward neglected skills.",
    durationMinutes,
    blocks,
  }
}
