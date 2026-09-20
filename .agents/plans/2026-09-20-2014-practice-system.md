# ExecPlan: Turn FretFlow into a measurable guitar-practice system

Source: User feature brief plus review of the current FretFlow codebase and running application.

## Goal

Extend the existing explorer into a local-first practice application that helps users:

- Practice consistently.
- Test fretboard recall.
- Improve clean playing speed.
- Train chords, intervals, scales, rhythm, and hearing.
- Follow adaptive routines.
- See measurable progress over time.

Implementation will proceed as independently shippable vertical slices. The first release will deliver the complete loop: choose an exercise, practice, record results, and review progress.

## Constraints

- Preserve the existing scale, mode, chord, triad, arpeggio, and playback behavior.
- Keep musical calculations in pure TypeScript under `lib/`.
- Keep feature-specific React logic inside feature directories, not global `hooks/`.
- Continue using CSS variables for interval colors and `cn()` for class composition.
- Check shadcn before introducing dialogs, tabs, progress bars, or other generic UI components.
- Continue optimizing `NoteCell`; quiz support must not add per-cell state or unnecessary rerenders.
- Use the current `bun test` setup for domain tests.
- Store progress locally in the first release; no accounts, backend, or cross-device sync.
- Separate self-reported results from automatically verified results.
- Defer microphone pitch detection and audio timing analysis until the non-microphone practice loop is validated.
- Assume standard tuning initially, matching current application support.
- Open product question: whether a later account system should sync progress across devices.

## Architecture notes

The current application has four useful foundations:

1. Pure musical models in `lib/`.
2. A reusable interactive fretboard.
3. Recorded guitar playback.
4. Explorer state centralized in `app/page.tsx`.

Add a practice domain alongside these foundations rather than embedding practice rules in the existing explorer.

### Core data model

Create versioned types for:

- `ExerciseDefinition`: reusable exercise configuration.
- `RoutineDefinition`: ordered exercise blocks.
- `PracticeSession`: one active or completed practice period.
- `PracticeAttempt`: one answered prompt or completed repetition.
- `SessionSummary`: duration, accuracy, clean BPM, and completion.
- `SkillRating`: derived strength by skill and musical target.
- `PersonalBest`: highest verified or self-reported result.

Exercise types should use a discriminated union:

- `fretboardRecall`
- `tempoLadder`
- `technique`
- `chordTransition`
- `earTraining`
- `rhythm`
- `positionConnection`
- `construction`

Use a session state machine:

```text
idle -> ready -> running <-> paused -> completed
                         \-> abandoned
```

Domain functions generate prompts, score attempts, select weak material, and decide progression. React components only coordinate presentation and persistence.

### Persistence

Use a versioned local-storage document such as `fret-flow.practice.v1`. Include migration and validation functions so malformed or outdated data cannot break application startup.

Store raw sessions and attempts as the source of truth. Derive streaks, weekly totals, heatmaps, personal bests, and skill ratings rather than storing duplicate aggregates.

### Routes

Keep `/` as the explorer and add:

- `/practice`: daily routine, saved exercises, and active session runner.
- `/progress`: history, personal bests, consistency, and skill breakdowns.

The current “Save preset” action becomes “Save exercise,” capturing explorer settings plus a practice goal.

## Files to modify

### Existing files

- `app/page.tsx`: extract the explorer surface and expose its state as a savable exercise.
- `app/layout.tsx`: mount the practice-data provider and shared application shell.
- `components/layout/Navbar.tsx`: add Explore, Practice, and Progress navigation; wire Save Exercise.
- `components/fretboard/Fretboard.tsx`: support explorer and quiz interaction modes.
- `components/fretboard/StringRow.tsx`: render clickable hidden-answer positions during drills.
- `components/fretboard/NoteCell.tsx`: add memo-safe concealed, correct, and incorrect states.
- `components/layout/PlaybackControls.tsx`: allow playback configurations to become tempo exercises.
- `components/layout/hooks/usePlayback.ts`: coordinate playback ownership with practice audio.

### New application and feature files

- `app/practice/page.tsx`
- `app/progress/page.tsx`
- `components/explorer/Explorer.tsx`
- `components/practice/PracticeHome.tsx`
- `components/practice/PracticeSession.tsx`
- `components/practice/SessionSummary.tsx`
- `components/practice/RoutineBuilder.tsx`
- `components/practice/drills/FretboardRecallDrill.tsx`
- `components/practice/drills/TempoLadderDrill.tsx`
- `components/practice/drills/TechniqueDrill.tsx`
- `components/practice/drills/ChordTransitionDrill.tsx`
- `components/practice/drills/EarTrainingDrill.tsx`
- `components/practice/drills/RhythmDrill.tsx`
- `components/practice/drills/PositionConnectionDrill.tsx`
- `components/practice/drills/ConstructionDrill.tsx`
- `components/practice/hooks/usePracticeSession.ts`
- `components/practice/hooks/usePracticeStore.ts`
- `components/practice/hooks/useMetronome.ts`
- `components/progress/ProgressDashboard.tsx`
- `components/progress/FretboardHeatmap.tsx`
- `components/progress/PracticeCalendar.tsx`
- `components/progress/PersonalBests.tsx`
- `types/practice.ts`
- `lib/practice/exercises.ts`
- `lib/practice/scoring.ts`
- `lib/practice/progression.ts`
- `lib/practice/routines.ts`
- `lib/practice/statistics.ts`
- `lib/practice/storage.ts`
- `lib/practice/metronome.ts`
- `hooks/useLocalStorage.ts`

### New tests

- `tests/practice-exercises.test.ts`
- `tests/practice-scoring.test.ts`
- `tests/practice-progression.test.ts`
- `tests/practice-routines.test.ts`
- `tests/practice-statistics.test.ts`
- `tests/practice-storage.test.ts`
- `tests/metronome.test.ts`

Files under `lib/notes.ts`, `lib/scales.ts`, and `lib/chords.ts` should not change unless a test reveals a missing pure helper.

## Step-by-step implementation tasks

### 1. Establish the practice domain

1. Define the versioned practice types and exercise union.
2. Implement pure session scoring and summary calculation.
3. Implement storage validation, migration, import, and export.
4. Add a practice provider that hydrates after mount without causing rendering mismatches.
5. Add unit tests for corrupt data, schema upgrades, abandoned sessions, and empty history.

Completion condition: practice sessions can be created, completed, persisted, restored, and summarized without UI-specific logic.

### 2. Ship the first vertical slice: fretboard recall

1. Add `/practice` and `/progress`.
2. Add drill setup for note, root, and interval recall.
3. Support string, fret-range, root, and position constraints.
4. Extend the fretboard with a concealed quiz mode.
5. Record answer correctness and response time using monotonic timestamps.
6. Show immediate accessible feedback and the correct answer after a miss.
7. Add a session summary and progress dashboard.
8. Add a weakness heatmap by string, fret, note, and interval.
9. Apply spaced repetition so frequently missed targets appear sooner.

Completion condition: a user can complete a fretboard quiz, reload the app, and see retained accuracy, response time, weak positions, and practice history.

### 3. Add the metronome and tempo ladder

1. Build an independent metronome with count-in, accents, subdivisions, tap tempo, and volume.
2. Use audio-clock scheduling instead of UI timers for audible beats.
3. Add tempo-ladder rules: repetitions per level, increment, fallback, and target BPM.
4. Let users mark rounds clean or missed.
5. Track comfortable BPM separately from best BPM.
6. Add gap-click mode after the basic scheduler is stable.

Completion condition: a user can complete a structured tempo workout and see clean-BPM history for that exercise.

### 4. Add guided routines and technique development

1. Convert saved explorer configurations into reusable exercises.
2. Add 10-, 20-, and 30-minute routine templates.
3. Create scale, arpeggio, alternate-picking, legato, string-crossing, and sequence exercises.
4. Generate routines from recent practice, weak skills, and neglected categories.
5. Advance difficulty after two sessions at 85% or better.
6. Reduce tempo after repeated misses.
7. Allow manual routine editing and reordering.

Completion condition: the app can generate and run a balanced daily routine with clear progression rules.

### 5. Add chord-transition practice

1. Generate chord pairs and common progressions from existing voicings.
2. Add one-minute changes and change-on-click modes.
3. Let users choose open, barre, or mixed transitions.
4. Record clean changes, missed changes, and chord-pair difficulty.
5. Prioritize weak transitions in later routines.

Completion condition: users can track clean changes per minute and improvement for individual chord pairs.

### 6. Add ear training

1. Reuse the guitar sampler for single notes, intervals, scale degrees, and chord qualities.
2. Add answer controls and fretboard-answer mode.
3. Prevent visual disclosure until an answer is submitted.
4. Track accuracy, response time, and commonly confused answers.
5. Adapt question weighting toward weak interval and chord categories.

Completion condition: users receive adaptive ear-training sessions with category-level progress.

### 7. Add rhythm practice

1. Add quarter, eighth, triplet, sixteenth, rest, syncopation, and accent patterns.
2. Render a beat grid synchronized with the metronome.
3. Support keyboard and touch tapping for objectively scored rhythm exercises.
4. Calculate average offset and timing variability.
5. Add swing, odd meters, and gap-click as advanced levels.

Completion condition: tap-based exercises produce repeatable timing scores without requiring microphone access.

### 8. Add position and construction drills

1. Generate adjacent-position scale transitions.
2. Prompt users to continue sequences across strings and positions.
3. Add interval, triad, seventh-chord, and inversion construction prompts.
4. Validate selected fretboard positions against pure musical rules.
5. Feed errors into the same spaced-repetition and routine systems.

Completion condition: users can practice connecting shapes and constructing musical structures rather than only identifying them.

### 9. Add optional microphone assessment

Only begin after the preceding practice modes are validated.

1. Request microphone permission only when the user starts a compatible drill.
2. Add monophonic pitch detection for single-note exercises.
3. Add onset detection for timing analysis.
4. Mark results as automatically verified only when confidence is sufficient.
5. Fall back to self-report when browser support or signal quality is inadequate.
6. Keep recordings in memory; do not persist raw audio by default.

Completion condition: compatible drills can verify played pitch or timing while retaining a fully functional non-microphone path.

## Validation and testing plan

- Add pure unit tests for prompt generation, deterministic randomization, scoring, progression, routine selection, statistics, and migrations.
- Preserve regression coverage for all existing scale, chord, arpeggio, tuning, and fretboard calculations.
- Verify `NoteCell` memoization and ensure quiz state does not trigger the entire fretboard unnecessarily.
- Test keyboard-only completion and screen-reader announcements for prompts, answers, timers, and summaries.
- Test reload during active, paused, completed, and corrupt sessions.
- Test practice history across date and timezone boundaries.
- Test metronome pause and resume, background-tab behavior, tempo changes, and audio cleanup.
- Test empty history, one-session history, and large histories.
- Run after every milestone:

```bash
bun test
bun typecheck
bun lint
bun build
```

- Manually verify the main flows in a browser at desktop and narrow viewport sizes.
- Store any browser-review screenshots under `.playwright-mcp/`.

## Risks and rollback notes

- **Scope size:** Each milestone must remain independently releasable. Do not begin microphone work before the local practice loop is useful.
- **Storage corruption:** Validate before hydration and preserve the previous document during migration. Offer JSON export before destructive recovery.
- **Timer throttling:** Derive elapsed time from timestamps and schedule audio against the audio clock rather than counting timer callbacks.
- **Misleading progress:** Label self-reported and automatically verified records separately.
- **Audio conflicts:** Enforce one active audio owner so explorer playback, ear training, and the metronome cannot overlap accidentally.
- **Fretboard performance:** Keep session state above the fretboard and pass primitive, memo-stable cell props.
- **Large histories:** Add retention or aggregation only after measuring real storage use; never silently delete sessions.
- **Rollback:** Each route and drill should be feature-isolated. Practice navigation can be disabled without changing the existing explorer or musical calculations.

The recommended implementation starting point is Steps 1–2: the practice domain plus fretboard recall, session history, and progress reporting. That provides the smallest complete and measurable product improvement before expanding into the other drill types.
