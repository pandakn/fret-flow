import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  getChordToneSpec,
  getProgressionById,
  getProgressionsByGenre,
  getQuizRound,
  getStepRootNote,
  PROGRESSIONS,
  PROGRESSION_GENRES,
  type ProgressionGenreId,
} from "../lib/progressions/catalog"
import {
  buildPlaybackPlan,
  getNoteFrequency,
  getStepChordNotes,
  noteToMidi,
} from "../lib/progressions/playback"

describe("progression catalog", () => {
  test("covers five genres with at least three progressions each", () => {
    assert.deepEqual(PROGRESSION_GENRES, [
      "pop",
      "rnb",
      "neo_soul",
      "blues",
      "funk",
    ])

    for (const genre of PROGRESSION_GENRES) {
      assert.ok(
        getProgressionsByGenre(genre).length >= 3,
        `genre ${genre} should have at least 3 progressions`
      )
    }
  })

  test("every step references a known tone stack and valid offset", () => {
    for (const progression of PROGRESSIONS) {
      assert.ok(progression.bpm >= 40 && progression.bpm <= 200)

      for (const step of progression.steps) {
        assert.ok(
          step.offset >= -6 && step.offset <= 12,
          `${progression.id} step offset ${step.offset} out of range`
        )
        assert.ok(step.bars >= 1 && Number.isInteger(step.bars))
        assert.notEqual(
          getChordToneSpec(step.toneId),
          undefined,
          `${progression.id} references unknown tone stack ${step.toneId}`
        )
        assert.ok(step.romanNumeral.trim().length > 0)
      }
    }
  })

  test("progression ids are unique", () => {
    const ids = PROGRESSIONS.map((item) => item.id)
    assert.equal(new Set(ids).size, ids.length)
  })

  test("resolves step roots diatonically and across borrowed offsets", () => {
    assert.equal(
      getStepRootNote(PaS(5), "A"),
      "D",
      "IV of A major is D"
    )
    assert.equal(
      getStepRootNote(PaS(-2), "A"),
      "G",
      "bVII of A major is G"
    )
    assert.equal(
      getStepRootNote(PaS(-2), "C"),
      "A#",
      "bVII of C wraps below C"
    )
    assert.equal(getStepRootNote(PaS(9), "C"), "A")
  })

  test("quiz rounds draw target and same-genre distractors", () => {
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }

    for (const genre of PROGRESSION_GENRES) {
      for (let round = 0; round < 50; round += 1) {
        const quiz = getQuizRound(genre, undefined, rng)

        assert.ok(
          getProgressionById(quiz.targetId) !== undefined,
          "target exists"
        )
        assert.equal(
          getProgressionsByGenre(genre).some(
            (item) => item.id === quiz.targetId
          ),
          true,
          "target belongs to the requested genre"
        )
        assert.equal(quiz.optionIds.length, 4)
        assert.equal(new Set(quiz.optionIds).size, 4, "options are distinct")
        assert.ok(quiz.optionIds.includes(quiz.targetId))
      }
    }
  })

  test("quiz rounds never repeat the excluded progression as target", () => {
    const genre: ProgressionGenreId = "blues"
    const exclude = getProgressionsByGenre(genre)[0].id

    for (let round = 0; round < 20; round += 1) {
      const quiz = getQuizRound(genre, exclude)
      assert.notEqual(quiz.targetId, exclude)
    }
  })
})

describe("progression playback", () => {
  test("converts notes to MIDI and frequency", () => {
    assert.equal(noteToMidi("C", 4), 60)
    assert.equal(noteToMidi("A", 4), 69)
    assert.equal(getNoteFrequency("A", 4), 440)
  })

  test("keys and EQ windows voice chords low and bass lower", () => {
    const progression = getProgressionById("rnb_doo_wop")
    assert.ok(progression)

    const plan = buildPlaybackPlan(progression, "C")
    assert.equal(plan.chordEvents.length, progression.steps.length)
    assert.equal(plan.totalBeats, 16)

    const first = plan.chordEvents[0]
    assert.deepEqual(
      first.frequencies.map((frequency) => Math.round(frequency * 100) / 100),
      [130.81, 164.81, 196.0, 246.94],
      "Imaj7 of C voiced upward from C3"
    )

    for (const chordEvent of plan.chordEvents) {
      assert.ok(chordEvent.frequencies[0] >= 130.8 && chordEvent.frequencies[0] < 246.95)
    }

    for (const bassEvent of plan.bassEvents) {
      assert.ok(bassEvent.frequency >= 65.4 && bassEvent.frequency < 123.48)
    }
  })

  test("schedules one bass note per bar, including multi-bar steps", () => {
    const progression = getProgressionById("blues_12bar")
    assert.ok(progression)

    const plan = buildPlaybackPlan(progression, "A")
    assert.equal(plan.totalBeats, 48)
    assert.equal(plan.bassEvents.length, 12, "12 bars in 12-bar blues")

    const firstBass = plan.bassEvents[0]
    assert.equal(firstBass.beat, 0)
    // A2
    assert.equal(Math.round(firstBass.frequency * 100) / 100, 110)

    const secondStepBeat = plan.chordEvents[1]?.beat
    assert.equal(secondStepBeat, 16, "IV7 enters after four bars")
  })

  test("resolves chord-tone notes for display", () => {
    const progression = getProgressionById("neosoul_2_5_1")
    assert.ok(progression)

    assert.deepEqual(
      getStepChordNotes(progression.steps[0], "C"),
      ["D", "F", "A", "C", "E"],
      "ii9 of C is D m9: D F A C E"
    )
    assert.deepEqual(getStepChordNotes(progression.steps[2], "C"), [
      "C",
      "E",
      "G",
      "B",
      "D",
    ])
  })
})

const PaS = (offset: number) => ({
  offset,
  toneId: "maj" as const,
  romanNumeral: "?",
  bars: 1,
})
