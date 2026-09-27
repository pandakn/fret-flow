import type { NoteName } from "./music"
import type { ExerciseKind } from "./practice"

export type LearningLevel = "recognize" | "apply" | "create"
export type LearningOrigin = "quick-check" | "guided-practice" | "review"

export type LearningContext = {
  key: NoteName
  root: NoteName
  chordId?: string
  degree?: number
  secondChord?: string
  minFret?: number
  maxFret?: number
}

export type SkillDefinition = { id: string; reviewable: boolean }
export type LearningObjective = {
  id: string
  skillIds: readonly string[]
  level: LearningLevel
}
export type LessonScene =
  | { kind: "interval" }
  | { kind: "chord"; chordIds: readonly string[]; showVoicings: boolean }
  | { kind: "caged" }
  | { kind: "diatonic" }
  | { kind: "progression" }
export type LessonDefinition = {
  id: string
  objectiveIds: readonly string[]
  activities: readonly (
    | "learn"
    | "visualize"
    | "hear"
    | "quick-check"
    | "practice"
  )[]
  scene: LessonScene
}
export type ExerciseTemplate = {
  id: string
  kind: ExerciseKind
  skillIds: readonly string[]
  level: LearningLevel
  evidence: "app-verified" | "self-reported" | "participation"
  priority: number
}
export type LearningAssignment = {
  templateId: string
  skillIds: string[]
  objectiveId: string
  lessonId?: string
  origin: LearningOrigin
  context: LearningContext
}
