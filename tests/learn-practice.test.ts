import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { createLearnExercise, parseLearnPracticeParams } from "../lib/learn-practice"
import { isLocale, localePath } from "../lib/i18n/locales"

describe("Learn to Practice handoff", () => {
  test("validates lesson context before building an exercise", () => {
    assert.equal(parseLearnPracticeParams({ lesson: "unknown", root: "C" }), null)
    assert.equal(parseLearnPracticeParams({ lesson: "triads", root: "H" }), null)
    assert.deepEqual(parseLearnPracticeParams({
      lesson: "caged",
      root: "A#",
      minFret: "8",
      maxFret: "12",
    }), {
      lesson: "caged",
      root: "A#",
      chordId: undefined,
      secondChord: undefined,
      minFret: 8,
      maxFret: 12,
    })
  })

  test("maps lesson types to existing drills without changing the practice schema", () => {
    const triad = createLearnExercise({ lesson: "triads", root: "C", chordId: "minor" })
    assert.equal(triad.kind, "construction")
    if (triad.kind !== "construction") throw new Error("Expected construction")
    assert.equal(triad.category, "triad")
    assert.equal(triad.chordId, "minor")

    const caged = createLearnExercise({ lesson: "caged", root: "C", minFret: 0, maxFret: 3 })
    assert.equal(caged.kind, "fretboardRecall")
    if (caged.kind !== "fretboardRecall") throw new Error("Expected recall")
    assert.deepEqual(caged.fretRange, { min: 0, max: 3 })

    const progression = createLearnExercise({ lesson: "progressions", root: "F", secondChord: "C" })
    assert.equal(progression.kind, "chordTransition")
    if (progression.kind !== "chordTransition") throw new Error("Expected transition")
    assert.deepEqual([progression.chordA, progression.chordB], ["F", "C"])
  })

  test("keeps locale in links and translates generated lesson exercise copy", () => {
    assert.equal(isLocale("th"), true)
    assert.equal(localePath("th", "/learn/caged"), "/th/learn/caged")
    const exercise = createLearnExercise({ lesson: "triads", root: "C" }, "th")
    assert.match(exercise.name, /ไตรแอด/)
  })
})
