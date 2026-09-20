# ExecPlan: Daily practice engagement loop

Source: User brief dated 2026-09-20 requesting non-gimmicky gamification, short rotating activities, drill variety, adaptive challenge, meaningful rewards, discovery, and game-inspired practice modes that build on FretFlow's current practice system.

## Goal

Make the existing practice system feel fresh enough to revisit daily without replacing its measurement-first character. The first complete slice adds a deterministic three-mission daily board: a short warm-up, an adaptive weak-spot mission, and a surprise wildcard. Missions reuse the eight existing exercise kinds, vary their musical and gameplay constraints, scale goals from recent performance, and end with evidence-based feedback such as a personal best, mastery milestone, or daily completion mark.

Definition of done:

- `/practice` presents three stable missions for the user's local day, each with an estimated duration, concrete success condition, difficulty label, and explanation of why it was selected.
- The three slots are meaningfully different: `warmup` is approachable, `weakSpot` targets low-strength or neglected material, and `wildcard` introduces a game-like modifier.
- Starting a mission uses the existing `PracticeSession` and drill UI; finishing it records mission identity and evaluates the stated goal from actual session results.
- Reopening the app on the same day preserves mission identity and completion state. A new local day rotates the set. One optional wildcard reroll per day is persisted.
- Difficulty adapts conservatively from recent sessions and never rises solely because time was spent. Verified accuracy/timing may drive automatic difficulty; self-reported drills require repeated clean results.
- Completion feedback highlights improvement against the user's own history, not global competition. Daily completion, personal records, and skill-specific milestones are visible on `/practice` and summarized on `/progress`.
- Existing free drills, guided 10/20/30-minute routines, streaks, personal bests, skill ratings, calendar, heatmap, import/export, and saved exercises keep working.

### Prioritized product recommendations

| Rank | Idea | Impact | Complexity | Why it should be fun and useful |
|---:|---|---|---|---|
| 1 | Daily three-mission board | High | Medium | Provides a small, finishable reason to return. Warm-up, weak spot, and wildcard create variety while every mission has a measurable musical goal. |
| 2 | Seeded drill variation deck | High | Medium | Changes root, fret zone, strings, direction, rhythm feel, prompt order, or constraint without inventing redundant drills. A daily seed makes the variation stable and testable. |
| 3 | “Beat your baseline” targets | High | Low–Medium | Turns past performance into a personal opponent: one more clean chord change, lower timing spread, faster recall, or a clean BPM step. Improvement feels concrete rather than abstract. |
| 4 | Adaptive difficulty bands | High | Medium | Keeps missions in a productive challenge zone by using accuracy, response time, timing variability, clean rounds, recency, and verification type. It reduces both boredom and discouraging jumps. |
| 5 | Weekly mastery check (“Boss set”) | High | Medium–High | Combines several learned skills into a short checkpoint with a clear win condition. Passing demonstrates retention; retrying exposes exactly what needs work. |
| 6 | Skill milestones and mastery paths | Medium–High | Medium | Rewards real achievements—such as all natural notes recalled under a response threshold or four clean tempo steps—rather than arbitrary clicks. It makes long-term progress discoverable. |
| 7 | Game modifiers for existing drills | Medium–High | Medium | Modes such as Note Hunt, shrinking metronome gaps, chord combo chains, one-string scale relays, and “three lives” change the decision pressure while training the same real skill. |
| 8 | Quick Play (60–180 seconds) | Medium–High | Low | Removes the “I do not have time” barrier and can feed directly into a daily mission. A tiny session can preserve momentum without pretending it equals a full practice day. |
| 9 | Weekly exploration card | Medium | Low–Medium | Offers a themed prompt such as “Dorian on strings 2–4” or “syncopation at a comfortable BPM,” creating discovery without locking core tools behind progression. |
| 10 | Gentle in-session streaks | Medium | Low | A clean-answer or on-time combo gives immediate flow feedback, but resets silently and never affects the calendar streak, avoiding punishment or speed-over-quality incentives. |

Items 1–4, plus the smallest useful portion of item 6, form this implementation slice. Items 5 and 7–10 are follow-ups after engagement and completion-rate data show which loop users value.

## Constraints

- Keep all music, generation, adaptation, scoring, and milestone rules in pure TypeScript under `lib/practice/`; React components only render and dispatch actions.
- Reuse the current eight `ExerciseKind` values and their drill components. The first slice adds challenge wrappers and modifiers, not new top-level exercise categories.
- Preserve `NoteCell` memoization and the established fretboard calculation, enharmonic, tuning, range, accessibility, and CSS-variable color rules.
- Use current local-only persistence and import/export. No account, cloud sync, social feed, leaderboard, competitive ranking, virtual currency, loot box, avatar economy, or notification system is in scope.
- A calendar practice day remains based on a completed session, not merely opening the app. Missing a day must not erase earned milestones or reduce a mastery score.
- Do not award mastery from elapsed time alone. Prefer app-verified attempts; cap or require repetition for claims derived from `self-reported` attempts.
- Randomization must accept an injected seeded random source so the same local day and stored variant seed reproduce the same missions and tests remain deterministic.
- Avoid inaccessible time pressure. Timed modes must provide pause/exit controls and their equivalent untimed free drill must remain available.
- Use shadcn components before introducing custom primitives and `cn()` for merged or conditional classes.
- Assumption: the first release remains single-device and local-first. Cross-device daily identity and timezone reconciliation are explicitly out of scope.
- Product question to validate after release: should a completed mission be replayable for score, or should replay launch an untracked practice copy? Default in this plan: replay is allowed and only the best result for that mission is displayed.

## Architecture notes

The existing data flow is `PracticeHome` → `PracticeSession` → a drill component → `usePracticeSession` → `PracticeProvider` → versioned local storage. Sessions already contain the exercise snapshot and attempts required to evaluate most challenge goals. The engagement layer should therefore generate mission definitions from history, pass mission context into the existing session, and derive results from the completed session instead of maintaining a second scoring system.

Add a pure `lib/practice/challenges.ts` boundary responsible for local day keys, seeded randomization, candidate generation, three-slot selection, exercise mutation, and goal evaluation. It should call existing helpers such as `getWeakTargets`, `getSkillRatings`, `summarizeSession`, `nextTempo`, and `createDefaultExercise` rather than duplicate their rules. A separate `lib/practice/milestones.ts` derives stable milestone IDs and progress from sessions so import/export and historical recalculation stay consistent.

Daily mission generation should follow this pipeline:

1. Compute the user's local `YYYY-MM-DD` day key.
2. Combine the day key with persisted reroll state to create a deterministic PRNG seed.
3. Build candidates from saved exercises and defaults, excluding impossible or recently overused combinations.
4. Select an easy warm-up, a low-strength/neglected weak-spot task, and a contrasting wildcard.
5. Apply kind-specific modifiers within safe bounds—for example a fret zone/string subset for recall, goal BPM and gap bars for tempo, chord pair for changes, or shuffled interval pool for ear training.
6. Calculate a goal from recent comparable sessions and attach a short selection reason.
7. Reconstruct completion and best result by matching mission IDs on completed sessions.

Extend `PracticeSession` with optional challenge metadata rather than creating a parallel challenge-session type. Existing `routineId` remains readable for version-1 imports; a version-2 migration adds challenge state with safe defaults and preserves all prior sessions. Store only state that cannot be derived: the current day's reroll count/seed and acknowledged celebration IDs. Mission completion, records, mastery progress, and daily totals remain derived from sessions.

The initial reward model has three layers:

- Immediate: goal met, improvement delta, and optional clean-combo feedback inside the session summary.
- Daily: one segment per mission and a restrained “daily set complete” acknowledgement.
- Long-term: skill-specific milestones derived from measurable thresholds, plus existing personal bests and calendar streaks. No spendable points are introduced.

## Files to modify

- `types/practice.ts`: add daily mission slots, goals, modifiers, session challenge metadata, milestone types, and schema-v2 persisted challenge state.
- `lib/practice/challenges.ts`: add deterministic PRNG, mission generation, adaptive goal selection, safe exercise mutations, completion lookup, and goal evaluation.
- `lib/practice/milestones.ts`: add evidence-based milestone definitions, progress calculation, and newly-earned detection.
- `lib/practice/progression.ts`: expose comparable-history and conservative difficulty-band helpers used by mission generation.
- `lib/practice/storage.ts`: bump to schema version 2, migrate version 1 without data loss, and validate new persisted fields.
- `components/practice/hooks/usePracticeStore.ts`: extend the store contract for daily reroll and milestone acknowledgement.
- `components/practice/PracticeProvider.tsx`: persist daily challenge state and attach optional mission metadata when starting a session.
- `components/practice/hooks/usePracticeSession.ts`: accept and forward optional mission context.
- `components/practice/PracticeHome.tsx`: place the daily board above the existing adaptive routine and launch missions through the existing queue/session path.
- `components/practice/DailyMissionBoard.tsx`: add the three mission cards, completion states, rationale, progress, and one-per-day wildcard reroll.
- `components/practice/PracticeSession.tsx`: show the active mission goal/modifier without changing free-drill behavior.
- `components/practice/SessionSummary.tsx`: show goal result, personal improvement delta, newly earned milestone, and replay/continue actions.
- `components/progress/ProgressDashboard.tsx`: add compact mastery and daily-mission summaries alongside, not instead of, current streaks and personal bests.
- `components/progress/MasteryMilestones.tsx`: render earned and in-progress skill milestones with measurable criteria.
- `tests/practice-challenges.test.ts`: cover seeded stability, daily rotation, slot diversity, adaptation bounds, rerolls, recent-kind avoidance, and every goal evaluator.
- `tests/practice-milestones.test.ts`: cover verified/self-reported thresholds, stable IDs, progress, deduplication, and historical derivation.
- `tests/practice-storage.test.ts`: cover version-1-to-version-2 migration, round-trip persistence, malformed challenge state, and import preservation.
- `tests/practice-progression.test.ts`: cover difficulty bands, sparse history, plateaus, repeated clean self-reports, and regression handling.
- `tests/practice-statistics.test.ts`: add daily mission completion and best-result derivation cases if those selectors remain in statistics rather than challenges.
- `app/globals.css`: only add semantic tokens or reduced-motion-safe celebration styles if existing tokens cannot express the mission states.
- `components/fretboard/NoteCell.tsx`: must not change unless a game modifier proves impossible through existing quiz props; preserving the hot path is the default.
- `lib/notes.ts`, `lib/scales.ts`, `lib/fretboard.ts`, and `lib/tunings.ts`: must not change; mission generation consumes these established theory rules.

## Step-by-step implementation tasks

1. Add failing unit tests for a deterministic seeded random helper, three distinct daily slots, stable same-day output, next-day rotation, safe modifier bounds, sparse-history defaults, comparable-session baseline selection, and goal evaluation. Complete when the tests describe every supported goal and modifier without React dependencies.
2. Introduce the challenge and milestone domain types in `types/practice.ts`. Model goals as a discriminated union (`accuracy`, `responseTime`, `timingVariability`, `cleanCount`, or `bpm`) so evaluation is exhaustive and display formatting does not parse strings.
3. Implement `lib/practice/challenges.ts`. Generate candidates from current exercise definitions, weight the weak-spot slot using target/skill history, keep the warm-up below the user's recent median difficulty, choose a wildcard from a contrasting skill family, and return an explicit human-readable reason for each choice.
4. Implement drill variation as exercise snapshots plus optional modifiers. Start with settings the current drills already understand; where a modifier requires UI behavior, add the smallest typed prop/config branch in that drill rather than creating a duplicate drill component.
5. Implement conservative difficulty selection in `lib/practice/progression.ts`: require at least two comparable successful sessions to advance, regress one band after repeated misses, cap per-day change to one band, and treat self-reported success more cautiously than app-verified success.
6. Add milestone derivation in `lib/practice/milestones.ts`. Ship a small initial set covering fretboard accuracy/response, rhythm consistency, ear accuracy, chord clean changes, tempo, category breadth, and daily-set completion. Each criterion must state the measurable threshold and verification policy.
7. Upgrade persistence to schema version 2. Migrate all version-1 fields unchanged, initialize daily state and acknowledgement arrays, reject malformed data safely, and confirm export/import round trips preserve challenge-linked sessions.
8. Extend the practice store/session API so `startSession` may receive mission metadata and completion remains a normal session transition. Add actions to consume the single daily wildcard reroll and acknowledge milestone celebrations; avoid persisting derived completion or score fields.
9. Build `DailyMissionBoard` with three cards and put it before `RoutineBuilder`. Each card shows slot, duration, exercise, success condition, difficulty, selection reason, completed/best state, and start/replay action. Allow only the wildcard card to reroll once per day so adaptation cannot be gamed away.
10. Add mission context to `PracticeSession` and augment `SessionSummary` with goal met/not yet, current-versus-baseline delta, a personal-best callout, and at most one newly earned milestone. Keep celebrations brief, keyboard/screen-reader legible, and disabled under reduced motion.
11. Add a compact mastery section on `/progress`, separating earned milestones from “next closest” progress. Retain existing streak, calendar, heatmap, skill rating, personal-best, and recent-session sections so users can connect rewards to evidence.
12. Run formatting only on touched files, then execute the complete validation suite. Manually verify first-use, experienced-user, same-day reload, next-day rotation with an injected clock, reroll persistence, mission replay, free drill, guided routine, import/export, mobile layout, keyboard operation, reduced motion, and screen-reader announcements.
13. Instrument no external analytics in this local-first slice. Define evaluation signals from local data for later product review: daily-board start rate, mission completion rate by slot, repeat days per week, reroll rate, and abandonment rate versus free drills. Any future telemetry requires a separate privacy and product decision.

### Optional follow-up slices

1. Add the weekly “Boss set” after daily missions have stable completion data; compose three short sections and report mastery/weakness rather than a single opaque score.
2. Add game modifiers incrementally: Note Hunt for fretboard recall, shrinking/growing click gaps for rhythm and tempo, clean combo chains for chord changes, and one-string/position relays for scales.
3. Add Quick Play as a 60/120/180-second entry point that selects one safe mission generator and still records a normal session.
4. Add weekly exploration cards with curated theory combinations and explanations, without gating access to scales, chords, or fretboard tools.
5. Consider a non-punitive momentum model only if users find calendar streaks stressful; never consume “streak freezes” or sell recovery mechanics.

## Validation and testing plan

- `rtk bun test`: all existing tests plus challenge, milestone, migration, and progression tests pass. Expected: deterministic results with injected dates/random sources and no reliance on wall-clock order.
- `rtk bun typecheck`: exhaustive unions, session metadata, store actions, and migrations type-check with no errors.
- `rtk bun lint`: no lint errors or new warnings in changed files.
- `rtk bun run build`: `/practice` and `/progress` build successfully under Next.js production compilation.
- Browser QA at desktop and mobile widths: complete each mission type, reload between attempts, use the wildcard reroll, replay a completed mission, run a free drill and routine, confirm prior progress views still render, and save screenshots only under `.playwright-mcp/`.
- Accessibility QA: keyboard-only card/start/reroll/session flow; logical focus after completion; `aria-live` result and milestone announcements; no color-only completion indicators; reduced-motion behavior; automated WCAG A/AA scan of daily board, active mission, summary, and progress milestone states.
- Storage QA: import a version-1 fixture, confirm every historical session/routine/exercise remains, export version 2, reimport it, and verify identical mission links and acknowledged milestones.
- Boundary cases: brand-new user, only self-reported history, one exercise kind practiced exclusively, zero-attempt completed/abandoned sessions, midnight rollover while the page is open, timezone/date changes, corrupt persisted daily state, and a personal baseline that already exceeds configured modifier bounds.
- Product acceptance checks: the board never generates three missions from the same skill family; goals always say how success is measured; wildcard differences are musically meaningful; failure language stays neutral; and no reward is granted only for opening the page.

## Risks and rollback notes

- Adaptive goals may feel unfair when comparing unlike configurations. Mitigate by matching exercise kind plus relevant configuration fields before calculating a baseline, otherwise use a conservative default and label it as such.
- Seeded randomization can produce monotonous combinations despite being technically different. Use weighted recent-history exclusions and test distribution across a fixed 30-day seed window.
- Self-reported clean rounds can inflate milestones. Mark reward provenance, require repeated clean results, and reserve the strongest mastery language for app-verified measures.
- A schema migration could hide historical data if validation is too strict. Preserve the raw version-1 session shapes, default only new fields, and regression-test import/export fixtures before UI work lands.
- Daily missions may compete visually with the existing adaptive routine. Keep the board compact and first, label the routine as the longer guided option, and compare start/completion behavior before considering removal or merging.
- Celebration UI can become noisy or inaccessible. Show at most one milestone per summary, keep motion subtle and optional, and allow immediate dismissal.
- Midnight rollover can invalidate a mission mid-session. Snapshot mission metadata at session start; let that session complete against its original goal, then refresh the board after exit.
- The feature is locally reversible: hide `DailyMissionBoard`, stop passing challenge metadata, and leave version-2 fields ignored. Existing sessions and version-1-compatible content remain intact; no destructive rollback or data deletion is required.
