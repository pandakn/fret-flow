# Learn and Practice

Lessons and exercise templates meet through skill IDs in `lib/learning/catalog.ts`.
A lesson names objectives; each objective names skills. An exercise template names
the skills it trains and its level (`recognize`, `apply`, or `create`). The
resolver selects a compatible template by skill and level. Neither catalog
entry stores an ID for the other.

`LessonStudio` renders the activity sequence and scene declared by its lesson.
The scene selects an existing interaction: interval, chord, CAGED, diatonic, or
progression. A new lesson using one of those scenes needs a lesson catalog entry,
an objective, and English and Thai copy in `lib/i18n/lessons.ts`. A new kind of
interaction needs a scene renderer as well.

`lib/learning/exercises.ts` turns a template and typed musical context into the
existing `ExerciseDefinition` consumed by Practice. Quick Checks use four
questions; guided drills use the existing session and attempt flow. Session
metadata snapshots the template, objective, skills, origin, and context. This
keeps past results understandable if the catalog changes later.

Scored attempts and optional musical application have separate records. Skill
evidence uses completed sessions with answers; free play records only whether
the learner tried it. Review uses app-verified answers for concrete targets.
Weak-skill lesson suggestions require repeated misses. Repeated self reports
can also suggest a lesson, with wording that identifies their source.

Domain IDs, formulas, scene settings, and exercise configuration stay in
`lib/learning/`, `lib/theory/`, and `lib/practice/`. User-facing text lives in
`lib/i18n/learning.ts` and `lib/i18n/lessons.ts`.

## Adding a topic

1. Add a stable skill and objective in `lib/learning/catalog.ts`.
2. Add a lesson there and its English and Thai content in `lib/i18n/lessons.ts`.
3. Reuse a scene where possible; add a renderer for a new interaction.
4. Add one or more exercise templates declaring trained skills, level, and
   evidence type. Configure them in `lib/learning/exercises.ts`.
5. Add template names, descriptions, and any Create prompt in
   `lib/i18n/learning.ts`.
6. Keep target keys stable. New reviewable skills need a prompt that can repeat
   the exact target; otherwise leave `reviewable` false until that prompt exists.
