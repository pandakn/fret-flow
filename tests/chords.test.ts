import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { CHORDS, getChordNotes, getTriadChordTypes } from "../lib/chords"
import type { NoteName } from "../types/music"

const expectedNotes: Record<NoteName, Record<string, string[]>> = {
  C: {
    major: ["C", "E", "G"],
    minor: ["C", "D#", "G"],
    dominant_7: ["C", "E", "G", "A#"],
    minor_7: ["C", "D#", "G", "A#"],
    major_7: ["C", "E", "G", "B"],
    half_diminished_7: ["C", "D#", "F#", "A#"],
    diminished: ["C", "D#", "F#"],
    augmented: ["C", "E", "G#"],
    sus2: ["C", "D", "G"],
    sus4: ["C", "F", "G"],
  },
  E: {
    major: ["E", "G#", "B"],
    minor: ["E", "G", "B"],
    dominant_7: ["E", "G#", "B", "D"],
    minor_7: ["E", "G", "B", "D"],
    major_7: ["E", "G#", "B", "D#"],
    half_diminished_7: ["E", "G", "A#", "D"],
    diminished: ["E", "G", "A#"],
    augmented: ["E", "G#", "C"],
    sus2: ["E", "F#", "B"],
    sus4: ["E", "A", "B"],
  },
  B: {
    major: ["B", "D#", "F#"],
    minor: ["B", "D", "F#"],
    dominant_7: ["B", "D#", "F#", "A"],
    minor_7: ["B", "D", "F#", "A"],
    major_7: ["B", "D#", "F#", "A#"],
    half_diminished_7: ["B", "D", "F", "A"],
    diminished: ["B", "D", "F"],
    augmented: ["B", "D#", "G"],
    sus2: ["B", "C#", "F#"],
    sus4: ["B", "E", "F#"],
  },
  "C#": {} as Record<string, string[]>,
  D: {} as Record<string, string[]>,
  "D#": {} as Record<string, string[]>,
  F: {} as Record<string, string[]>,
  "F#": {} as Record<string, string[]>,
  G: {} as Record<string, string[]>,
  "G#": {} as Record<string, string[]>,
  A: {} as Record<string, string[]>,
  "A#": {} as Record<string, string[]>,
}

describe("chord catalog", () => {
  test("contains every initial chord type with a closed octave formula", () => {
    assert.deepEqual(
      CHORDS.map((chord) => chord.id),
      [
        "major",
        "minor",
        "dominant_7",
        "minor_7",
        "major_7",
        "half_diminished_7",
        "diminished",
        "augmented",
        "sus2",
        "sus4",
      ]
    )

    for (const chord of CHORDS) {
      assert.equal(
        chord.formula.reduce((total, step) => total + step, 0),
        12
      )
      assert.equal(chord.intervals.length, chord.formula.length)
    }
  })

  test("returns every three-tone chord type as a triad", () => {
    const triads = getTriadChordTypes()

    assert.deepEqual(
      triads.map((chord) => chord.id),
      ["major", "minor", "diminished", "augmented", "sus2", "sus4"]
    )

    for (const triad of triads) {
      assert.equal(triad.intervals.length, 3)
      assert.equal(triad.formula.length, 3)
      assert.equal(
        triad.formula.reduce((total, step) => total + step, 0),
        12
      )
    }
  })

  for (const root of ["C", "E", "B"] as const) {
    test(`calculates every chord type from ${root}`, () => {
      for (const chord of CHORDS) {
        assert.deepEqual(
          getChordNotes(root, chord.formula),
          expectedNotes[root][chord.id]
        )
      }
    })
  }
})
