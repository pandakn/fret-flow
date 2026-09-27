import { getChordById } from "@/lib/chords"
import { getDiatonicTriads } from "@/lib/theory/diatonic"
import { getKeyLabel } from "@/lib/theory/spelling"
import { learningCopy } from "@/lib/i18n/learning"
import { localizePracticeText } from "@/lib/i18n/practice-messages"
import type { Locale } from "@/lib/i18n/locales"
import { createDefaultExercise } from "@/lib/practice/exercises"
import type { ExerciseDefinition } from "@/types/practice"
import type { LearningAssignment } from "@/types/learning"
import { getTemplate, isExerciseTemplateId } from "./catalog"
import type { DueTarget } from "./review"

export function createLearningExercise(
  assignment: LearningAssignment,
  locale: Locale
): ExerciseDefinition | null {
  const template = getTemplate(assignment.templateId)
  if (
    !template ||
    !template.skillIds.some((id) => assignment.skillIds.includes(id))
  )
    return null
  const base = createDefaultExercise(template.kind)
  const context = assignment.context
  const title = learningCopy[locale].names[template.id] ?? base.name
  const description =
    learningCopy[locale].descriptions[template.id] ?? base.description
  const common = {
    ...base,
    name: `${getKeyLabel(context.key)} · ${title}`,
    description,
    durationMinutes: assignment.origin === "quick-check" ? 2 : 5,
    learning: assignment,
    skillIds: [...assignment.skillIds],
  }
  const questionCount = assignment.origin === "quick-check" ? 4 : 8
  switch (template.id) {
    case "interval-construction":
    case "triad-construction":
    case "seventh-construction":
    case "diatonic-identification":
      if (common.kind !== "construction") return null
      return {
        ...common,
        category:
          template.id === "interval-construction"
            ? "interval"
            : template.id === "triad-construction"
              ? "triad"
              : template.id === "seventh-construction"
                ? "seventh"
                : "diatonic",
        root: context.root,
        key: context.key,
        degree: context.degree,
        chordId:
          template.id === "diatonic-identification"
            ? getDiatonicTriads(context.key)[(context.degree ?? 1) - 1]?.chordId
            : context.chordId,
        questionCount,
      }
    case "caged-root-recall":
    case "interval-recall":
      if (common.kind !== "fretboardRecall") return null
      return {
        ...common,
        recall: template.id === "caged-root-recall" ? "root" : "interval",
        root: context.root,
        fretRange: { min: context.minFret ?? 0, max: context.maxFret ?? 12 },
        questionCount,
      }
    case "progression-changes":
      if (common.kind !== "chordTransition") return null
      return {
        ...common,
        chordA: `${getKeyLabel(context.root)}${getChordById(context.chordId ?? "major")?.symbol ?? ""}`,
        chordB: context.secondChord ?? "G",
      }
    default:
      if (
        common.kind === "fretboardRecall" ||
        common.kind === "earTraining" ||
        common.kind === "technique" ||
        common.kind === "positionConnection"
      )
        return { ...common, root: context.root }
      return common
  }
}

export function createDueReviewExercise(
  due: DueTarget,
  locale: Locale
): ExerciseDefinition | null {
  const degree =
    due.skillId === "diatonic.chord.identify"
      ? Number(due.key.split(":").at(-1))
      : undefined
  const assignment: LearningAssignment = {
    ...due.assignment,
    origin: "review",
    skillIds: [due.skillId],
    context:
      Number.isInteger(degree) && degree! >= 1 && degree! <= 7
        ? { ...due.assignment.context, degree }
        : due.assignment.context,
  }
  const exercise = createLearningExercise(assignment, locale)
  if (!exercise) return null
  const name = `${learningCopy[locale].review} · ${exercise.name}`
  if (exercise.kind === "construction")
    return { ...exercise, name, reviewTarget: due.target, questionCount: 4 }
  if (exercise.kind === "fretboardRecall")
    return {
      ...exercise,
      name,
      reviewTarget: due.key.startsWith("position:")
        ? due.target
        : { ...due.target, string: undefined, fret: undefined },
      questionCount: 4,
    }
  return { ...exercise, name, reviewTarget: due.target }
}

export function getExerciseDisplayText(
  exercise: ExerciseDefinition,
  locale: Locale
): { name: string; description: string } {
  const assignment = exercise.learning
  if (!assignment)
    return {
      name: localizePracticeText(locale, exercise.name),
      description: localizePracticeText(locale, exercise.description),
    }
  const title = isExerciseTemplateId(assignment.templateId)
    ? learningCopy[locale].names[assignment.templateId]
    : undefined
  const description = isExerciseTemplateId(assignment.templateId)
    ? learningCopy[locale].descriptions[assignment.templateId]
    : undefined
  if (!title || !description)
    return {
      name: localizePracticeText(locale, exercise.name),
      description: localizePracticeText(locale, exercise.description),
    }
  const name = `${getKeyLabel(assignment.context.key)} · ${title}`
  return {
    name:
      assignment.origin === "review"
        ? `${learningCopy[locale].review} · ${name}`
        : name,
    description,
  }
}
