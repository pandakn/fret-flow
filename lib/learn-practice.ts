import { getChordById } from "./chords"
import { CHROMATIC } from "./notes"
import { createDefaultExercise } from "./practice/exercises"
import { isLessonId, type LessonId } from "./i18n/lessons"
import { getKeyLabel } from "./theory/spelling"
import type { ExerciseDefinition } from "@/types/practice"
import type { NoteName } from "@/types/music"
import type { Locale } from "./i18n/locales"

export type LearnPracticeParams = {
  lesson: LessonId
  root: NoteName
  chordId?: string
  secondChord?: string
  minFret?: number
  maxFret?: number
}

export function parseLearnPracticeParams(
  values: Record<string, string | string[] | undefined>
): LearnPracticeParams | null {
  const lesson = values.lesson
  const root = values.root
  if (typeof lesson !== "string" || !isLessonId(lesson)) return null
  if (typeof root !== "string" || !CHROMATIC.includes(root as NoteName))
    return null
  const chordId =
    typeof values.chordId === "string" && getChordById(values.chordId)
      ? values.chordId
      : undefined
  const secondChord =
    typeof values.secondChord === "string" && values.secondChord.length <= 12
      ? values.secondChord
      : undefined
  const minFret = Number(values.minFret)
  const maxFret = Number(values.maxFret)
  return {
    lesson,
    root: root as NoteName,
    chordId,
    secondChord,
    minFret:
      Number.isInteger(minFret) && minFret >= 0 && minFret <= 21
        ? minFret
        : undefined,
    maxFret:
      Number.isInteger(maxFret) && maxFret >= 0 && maxFret <= 21
        ? maxFret
        : undefined,
  }
}

export function createLearnExercise(
  params: LearnPracticeParams,
  locale: Locale = "en"
): ExerciseDefinition {
  const { lesson, root } = params
  const rootLabel = getKeyLabel(root)
  const id = `learn-${lesson}-${root}-${params.chordId ?? ""}`
  if (lesson === "caged") {
    const base = createDefaultExercise("fretboardRecall")
    if (base.kind !== "fretboardRecall") return base
    return {
      ...base,
      id,
      name:
        locale === "th"
          ? `หารูท CAGED ในคีย์ ${rootLabel}`
          : `${rootLabel} CAGED roots`,
      description:
        locale === "th"
          ? "หาโน้ตรูทในช่วงเฟรตนี้"
          : "Find the root notes in this part of the fretboard.",
      recall: "root",
      root,
      fretRange: {
        min: params.minFret ?? 0,
        max: Math.max(params.minFret ?? 0, params.maxFret ?? 12),
      },
    }
  }

  if (lesson === "progressions") {
    const base = createDefaultExercise("chordTransition")
    if (base.kind !== "chordTransition") return base
    return {
      ...base,
      id,
      name:
        locale === "th"
          ? `ฝึกเปลี่ยนคอร์ดในคีย์ ${rootLabel}`
          : `${rootLabel} progression changes`,
      description:
        locale === "th"
          ? "ฝึกเปลี่ยนระหว่างคอร์ดสองตัวให้เสียงชัด"
          : "Change cleanly between two chords in the progression.",
      chordA: `${rootLabel}${getChordById(params.chordId ?? "major")?.symbol ?? ""}`,
      chordB: params.secondChord ?? "G",
    }
  }

  const base = createDefaultExercise("construction")
  if (base.kind !== "construction") return base
  const category =
    lesson === "sevenths"
      ? "seventh"
      : lesson === "intervals"
        ? "interval"
        : "triad"
  return {
    ...base,
    id,
    name:
      locale === "th"
        ? `สร้าง${category === "seventh" ? "คอร์ดเซเวนธ์" : category === "triad" ? "ไตรแอด" : "อินเทอร์วัล"}ในคีย์ ${rootLabel}`
        : `${rootLabel} ${category} construction`,
    description:
      locale === "th"
        ? "ระบุโน้ตที่ประกอบเป็นเสียงนี้"
        : "Identify the notes that build this sound.",
    category,
    root,
    chordId: params.chordId,
  }
}
