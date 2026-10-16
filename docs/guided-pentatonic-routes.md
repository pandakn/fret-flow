# Guided pentatonic routes

This page records the route catalog and assessment rules used by Guided routes. The catalog covers major and minor pentatonic in all twelve roots. It uses standard six-string tuning and fret positions 1 through 17. It does not prescribe fingerings.

## Shape placement

The catalog uses the first and second neighboring minor-pentatonic boxes. Major pentatonic uses the same fretboard geometry referenced to its relative minor. The selected major root and major-pentatonic intervals remain the displayed musical identity.

String indexes in the catalog run from low E to high E, starting at zero. The physical guitar string number is `6 - stringIndex`.

| Shape     | Low E | A    | D    | G    | B    | High E |
| --------- | ----- | ---- | ---- | ---- | ---- | ------ |
| A offsets | 0, 3  | 0, 2 | 0, 2 | 0, 2 | 0, 3 | 0, 3   |
| B offsets | 3, 5  | 2, 5 | 2, 5 | 2, 4 | 3, 5 | 3, 5   |

Each offset is added to the pair's base fret. The base fret is the relative-minor tonic's fret on the low E string. For a minor selection, the relative minor is the selected root. For a major selection, it is the selected root nine semitones above. The catalog uses fret 12 instead of fret 0 when the pitch-class calculation reaches the nut. This keeps the pair movable and avoids a partial open-string shape. The base fret ranges from 1 through 12, so the pair ends no higher than fret 17.

The two shapes overlap at several coordinates. The connection route does not need to visit every shared coordinate. It follows this authored sequence, where each pair is `(stringIndex, fretOffset)`:

```text
(0,0), (0,3), (1,0), (1,2), (2,0), (2,2), (3,0),
(3,2), (3,4), (4,3), (4,5), (5,3), (5,5)
```

The position shift occurs on the G string, from offset 2 to offset 4. At the A-minor placement, that is string 3 at frets 7 and 9. Descending playback reverses the occurrence order and transition endpoints. It does not sort notes by pitch or remove repeated coordinates.

The catalog revision is `pentatonic-v1`. A saved exercise stores its complete shapes, occurrences, pitches, intervals, and transitions. Later catalog changes cannot reinterpret its history. A practice link with an unknown revision fails with a recoverable message.

## Study and playback

Explorer offers Shape A, Shape B, and Connection in ascending and descending directions. Study shows ordered steps, note names, intervals, physical string numbers, fret numbers, start and end locations, and the shift. Root occurrences use the root color and shape. Repeated visits to a coordinate retain separate step numbers.

Guitar playback uses the exact standard-tuning MIDI pitch for each occurrence. It starts at 60 BPM and accepts 30 through 120 BPM. Guided playback and each loop wrap use four count-in clicks. An explicit restart begins at the first route occurrence. Stop, page hiding, and unmount stop audio and retain the last visual location. Playback never resumes automatically. Audio failure leaves visual study available.

## Assessment and reporting

A check asks for each transition's exact next string and fret. It accepts no alternate register or string, even when the selected coordinate has the same note or pitch. Feedback distinguishes the same pitch, the same note in another register, a different scale tone, and a note outside the scale. A hint marks the current question as assisted.

The reducer records each deliberate answer with question, transition, occurrence, selected coordinate, expected coordinate, submission ordinal, and assistance state. Stable command IDs and the current question identity make repeated or stale actions no-ops. A wrong first answer remains a miss after a successful retry.

Unassisted first-answer accuracy is the count of correct unassisted first submissions divided by all unassisted first submissions. A zero denominator is unavailable, not zero percent. Assisted first submissions and retries have separate counts. The route check has no response-time or BPM score. The optional guitar phase records only the learner's self-reported participation. It does not grade pitch, timing, or technique.

Missed transitions can be replayed as a new scoped check. The original session remains unchanged. The historical Position links quiz and timed mastery stage keep their existing meanings.

## Storage and scope

Practice documents use schema 5 at `fret-flow.practice.v2`. The provider imports valid schema 0 through 4 history once from `fret-flow.practice.v1` and leaves the old key unchanged. It blocks writes when the new document is corrupt, unsupported, or unwritable. A valid import can recover the read-only state.

Guided routes open from Explorer or from a saved exercise. The app does not enroll them in daily missions, generated routines, lesson objectives, recall heatmaps, legacy review, or timed mastery. The app introduces no success-metric targets or analytics service.

The route pitches and all 24 root and scale combinations are covered by automated fixtures. The user approved the assistant-reviewed catalog for release. No independent guitarist reviewed its ergonomics or teaching quality. Automated pitch checks cannot establish either.
