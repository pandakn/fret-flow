import { CHROMATIC } from "./notes"
import { getChordById } from "./chords"
import { getDiatonicTriads } from "./theory/diatonic"
import { getLesson, getObjective, resolveTemplate } from "./learning/catalog"
import { createLearningExercise } from "./learning/exercises"
import { isLessonId, type LessonId } from "./i18n/lessons"
import type { ExerciseDefinition } from "@/types/practice"
import type {
  LearningAssignment,
  LearningContext,
  LearningOrigin,
} from "@/types/learning"
import type { NoteName } from "@/types/music"
import type { Locale } from "./i18n/locales"

export type LearnPracticeParams = {
  lesson: LessonId
  root: NoteName
  key?: NoteName
  chordId?: string
  degree?: number
  secondChord?: string
  minFret?: number
  maxFret?: number
  mode?: LearningOrigin
}

const note = (value: unknown): value is NoteName =>
  typeof value === "string" && CHROMATIC.includes(value as NoteName)
const fret = (value: unknown) => {
  const number = Number(value)
  return typeof value === "string" &&
    Number.isInteger(number) &&
    number >= 0 &&
    number <= 21
    ? number
    : undefined
}

export function parseLearnPracticeParams(
  values: Record<string, string | string[] | undefined>
): LearnPracticeParams | null {
  if (
    typeof values.lesson !== "string" ||
    !isLessonId(values.lesson) ||
    !note(values.root)
  )
    return null
  const minFret = fret(values.minFret)
  const maxFret = fret(values.maxFret)
  if (minFret !== undefined && maxFret !== undefined && minFret > maxFret)
    return null
  const degree =
    typeof values.degree === "string" ? Number(values.degree) : undefined
  return {
    lesson: values.lesson,
    root: values.root,
    chordId:
      typeof values.chordId === "string" && getChordById(values.chordId)
        ? values.chordId
        : undefined,
    secondChord:
      typeof values.secondChord === "string" && values.secondChord.length <= 12
        ? values.secondChord
        : undefined,
    minFret,
    maxFret,
    ...(note(values.key) ? { key: values.key } : {}),
    ...(Number.isInteger(degree) && degree! >= 1 && degree! <= 7
      ? { degree }
      : {}),
    ...(values.mode === "quick-check" || values.mode === "review"
      ? { mode: values.mode }
      : {}),
  }
}

export function resolveLearnAssignment(
  params: LearnPracticeParams
): LearningAssignment | null {
  const lesson = getLesson(params.lesson)
  const objective = lesson && getObjective(lesson.objectiveIds[0])
  const template =
    objective &&
    resolveTemplate(
      objective.id,
      params.mode === "quick-check" ? "recognize" : objective.level
    )
  if (!objective || !template) return null
  const key = params.key ?? params.root
  const degree =
    params.degree ??
    (key !== params.root
      ? getDiatonicTriads(key).find((chord) => chord.root === params.root)
          ?.degree
      : undefined)
  const context: LearningContext = {
    key,
    root: params.root,
    chordId: params.chordId,
    degree,
    secondChord: params.secondChord,
    minFret: params.minFret,
    maxFret: params.maxFret,
  }
  return {
    templateId: template.id,
    skillIds: template.skillIds.filter((id) =>
      objective.skillIds.some((skill) => skill === id)
    ),
    objectiveId: objective.id,
    lessonId: params.lesson,
    origin: params.mode ?? "guided-practice",
    context,
  }
}

export function createLearnExercise(
  params: LearnPracticeParams,
  locale: Locale = "en"
): ExerciseDefinition {
  const assignment = resolveLearnAssignment(params)
  const exercise = assignment && createLearningExercise(assignment, locale)
  if (!exercise) throw new Error(`No exercise for lesson ${params.lesson}`)
  return exercise
}
