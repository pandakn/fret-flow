import type {
  ExerciseTemplate,
  LearningObjective,
  LessonDefinition,
  SkillDefinition,
} from "@/types/learning"

export const SKILLS = [
  { id: "interval.construct", reviewable: true },
  { id: "triad.construct", reviewable: true },
  { id: "fretboard.root.locate", reviewable: true },
  { id: "diatonic.chord.identify", reviewable: true },
  { id: "progression.change", reviewable: false },
  { id: "seventh.construct", reviewable: true },
  { id: "chord.transition", reviewable: false },
  { id: "fretboard.note.locate", reviewable: true },
  { id: "fretboard.interval.locate", reviewable: true },
  { id: "ear.interval.recognize", reviewable: false },
  { id: "rhythm.pulse", reviewable: false },
  { id: "technique.tempo", reviewable: false },
  { id: "technique.control", reviewable: false },
  { id: "position.connect", reviewable: false },
  { id: "music.phrase.create", reviewable: false },
] as const satisfies readonly SkillDefinition[]

export const OBJECTIVES = [
  {
    id: "intervals.build",
    skillIds: ["interval.construct", "fretboard.interval.locate"],
    level: "recognize",
  },
  { id: "triads.build", skillIds: ["triad.construct"], level: "recognize" },
  {
    id: "caged.roots",
    skillIds: ["fretboard.root.locate"],
    level: "recognize",
  },
  {
    id: "diatonic.chords",
    skillIds: ["diatonic.chord.identify"],
    level: "recognize",
  },
  {
    id: "progressions.play",
    skillIds: ["diatonic.chord.identify", "progression.change"],
    level: "apply",
  },
  { id: "sevenths.build", skillIds: ["seventh.construct"], level: "recognize" },
] as const satisfies readonly LearningObjective[]

const ACTIVITIES = [
  "learn",
  "visualize",
  "hear",
  "quick-check",
  "practice",
] as const
export const LESSONS = [
  {
    id: "intervals",
    objectiveIds: ["intervals.build"],
    activities: ACTIVITIES,
    scene: { kind: "interval" },
  },
  {
    id: "triads",
    objectiveIds: ["triads.build"],
    activities: ACTIVITIES,
    scene: { kind: "chord", chordIds: ["major", "minor"], showVoicings: false },
  },
  {
    id: "caged",
    objectiveIds: ["caged.roots"],
    activities: ACTIVITIES,
    scene: { kind: "caged" },
  },
  {
    id: "diatonic",
    objectiveIds: ["diatonic.chords"],
    activities: ACTIVITIES,
    scene: { kind: "diatonic" },
  },
  {
    id: "progressions",
    objectiveIds: ["progressions.play"],
    activities: ACTIVITIES,
    scene: { kind: "progression" },
  },
  {
    id: "sevenths",
    objectiveIds: ["sevenths.build"],
    activities: ACTIVITIES,
    scene: {
      kind: "chord",
      chordIds: ["major_7", "minor_7", "dominant_7", "half_diminished_7"],
      showVoicings: true,
    },
  },
] as const satisfies readonly LessonDefinition[]

export const EXERCISE_TEMPLATES = [
  {
    id: "interval-construction",
    kind: "construction",
    skillIds: ["interval.construct"],
    level: "recognize",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "triad-construction",
    kind: "construction",
    skillIds: ["triad.construct"],
    level: "recognize",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "caged-root-recall",
    kind: "fretboardRecall",
    skillIds: ["fretboard.root.locate"],
    level: "recognize",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "diatonic-identification",
    kind: "construction",
    skillIds: ["diatonic.chord.identify"],
    level: "recognize",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "progression-changes",
    kind: "chordTransition",
    skillIds: ["progression.change"],
    level: "apply",
    evidence: "self-reported",
    priority: 1,
  },
  {
    id: "seventh-construction",
    kind: "construction",
    skillIds: ["seventh.construct"],
    level: "recognize",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "note-recall",
    kind: "fretboardRecall",
    skillIds: ["fretboard.note.locate"],
    level: "recognize",
    evidence: "app-verified",
    priority: 2,
  },
  {
    id: "interval-recall",
    kind: "fretboardRecall",
    skillIds: ["fretboard.interval.locate"],
    level: "recognize",
    evidence: "app-verified",
    priority: 2,
  },
  {
    id: "interval-ear",
    kind: "earTraining",
    skillIds: ["ear.interval.recognize"],
    level: "recognize",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "pulse",
    kind: "rhythm",
    skillIds: ["rhythm.pulse"],
    level: "apply",
    evidence: "app-verified",
    priority: 1,
  },
  {
    id: "tempo",
    kind: "tempoLadder",
    skillIds: ["technique.tempo"],
    level: "apply",
    evidence: "self-reported",
    priority: 1,
  },
  {
    id: "technique",
    kind: "technique",
    skillIds: ["technique.control"],
    level: "apply",
    evidence: "self-reported",
    priority: 2,
  },
  {
    id: "position-connection",
    kind: "positionConnection",
    skillIds: ["position.connect"],
    level: "apply",
    evidence: "app-verified",
    priority: 1,
  },
] as const satisfies readonly ExerciseTemplate[]

export type SkillId = (typeof SKILLS)[number]["id"]
export type ExerciseTemplateId = (typeof EXERCISE_TEMPLATES)[number]["id"]

export const isSkillId = (value: string): value is SkillId =>
  SKILLS.some((skill) => skill.id === value)
export const isExerciseTemplateId = (
  value: string
): value is ExerciseTemplateId =>
  EXERCISE_TEMPLATES.some((template) => template.id === value)

export const getLesson = (id: string) =>
  LESSONS.find((lesson) => lesson.id === id)
export const getObjective = (id: string) =>
  OBJECTIVES.find((objective) => objective.id === id)
export const getTemplate = (id: string) =>
  EXERCISE_TEMPLATES.find((template) => template.id === id)
export const lessonsForSkill = (skillId: string) =>
  LESSONS.filter((lesson) =>
    lesson.objectiveIds.some((id) =>
      getObjective(id)?.skillIds.some((skill) => skill === skillId)
    )
  )

export function resolveTemplate(
  objectiveId: string,
  level?: ExerciseTemplate["level"]
) {
  const objective = getObjective(objectiveId)
  if (!objective) return undefined
  return EXERCISE_TEMPLATES.filter(
    (template) =>
      (!level || template.level === level) &&
      template.skillIds.some((skill) =>
        objective.skillIds.some((id) => id === skill)
      )
  ).toSorted((a, b) => a.priority - b.priority)[0]
}
