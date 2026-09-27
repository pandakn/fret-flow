import type { ExerciseDefinition } from "@/types/practice"

export function getExerciseSkillIds(exercise: ExerciseDefinition): string[] {
  if (exercise.learning) return [...exercise.learning.skillIds]
  if (exercise.skillIds?.length) return [...exercise.skillIds]
  switch (exercise.kind) {
    case "construction":
      if (exercise.category === "inversion") return []
      return [
        exercise.category === "triad"
          ? "triad.construct"
          : exercise.category === "seventh"
            ? "seventh.construct"
            : exercise.category === "diatonic"
              ? "diatonic.chord.identify"
              : "interval.construct",
      ]
    case "fretboardRecall":
      return [
        exercise.recall === "root"
          ? "fretboard.root.locate"
          : exercise.recall === "interval"
            ? "fretboard.interval.locate"
            : "fretboard.note.locate",
      ]
    case "earTraining":
      return exercise.category === "interval" ? ["ear.interval.recognize"] : []
    case "chordTransition":
      return ["chord.transition"]
    case "rhythm":
      return ["rhythm.pulse"]
    case "tempoLadder":
      return ["technique.tempo"]
    case "technique":
      return ["technique.control"]
    case "positionConnection":
      return ["position.connect"]
  }
}
