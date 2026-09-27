import type { Locale } from "@/lib/i18n/locales"
import { localePath } from "@/lib/i18n/locales"
import type { LearningAssignment, LearningOrigin } from "@/types/learning"
import { getLesson } from "./catalog"

export function learningPracticeHref(
  locale: Locale,
  assignment: LearningAssignment,
  origin: LearningOrigin
): string | null {
  if (!assignment.lessonId || !getLesson(assignment.lessonId)) return null
  const { context } = assignment
  const query = new URLSearchParams({
    lesson: assignment.lessonId,
    root: context.root,
    key: context.key,
    mode: origin,
  })
  if (context.chordId) query.set("chordId", context.chordId)
  if (context.degree) query.set("degree", String(context.degree))
  if (context.secondChord) query.set("secondChord", context.secondChord)
  if (context.minFret !== undefined)
    query.set("minFret", String(context.minFret))
  if (context.maxFret !== undefined)
    query.set("maxFret", String(context.maxFret))
  return `${localePath(locale, "/practice")}?${query.toString()}`
}
