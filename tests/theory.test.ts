import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { getChordById } from "../lib/chords"
import {
  DEFAULT_CHORD_VOICING_FRET_RANGE,
  getCagedMajorVoicings,
} from "../lib/chord-voicings"
import {
  CAGED_SHAPE_IDS,
  getCagedMajorShapes,
} from "../lib/theory/caged"
import {
  getDiatonicSevenths,
  getDiatonicTriads,
} from "../lib/theory/diatonic"
import {
  getKeyLabel,
  getMajorScaleSpellings,
  spellNoteInKey,
} from "../lib/theory/spelling"
import { getNoteAtFret } from "../lib/notes"
import { getTuningById } from "../lib/tunings"
import type { NoteName } from "../types/music"

const standardTuning = getTuningById("standard")

if (!standardTuning) {
  throw new Error("Standard tuning is required for theory tests.")
}

describe("diatonic harmony", () => {
  test("returns major-key triads with qualities and Roman numerals", () => {
    const chords = getDiatonicTriads("C")

    assert.deepEqual(
      chords.map(({ romanNumeral, chordId, root, notes }) => ({
        romanNumeral,
        chordId,
        root,
        notes,
      })),
      [
        {
          romanNumeral: "I",
          chordId: "major",
          root: "C",
          notes: ["C", "E", "G"],
        },
        {
          romanNumeral: "ii",
          chordId: "minor",
          root: "D",
          notes: ["D", "F", "A"],
        },
        {
          romanNumeral: "iii",
          chordId: "minor",
          root: "E",
          notes: ["E", "G", "B"],
        },
        {
          romanNumeral: "IV",
          chordId: "major",
          root: "F",
          notes: ["F", "A", "C"],
        },
        {
          romanNumeral: "V",
          chordId: "major",
          root: "G",
          notes: ["G", "B", "D"],
        },
        {
          romanNumeral: "vi",
          chordId: "minor",
          root: "A",
          notes: ["A", "C", "E"],
        },
        {
          romanNumeral: "vii°",
          chordId: "diminished",
          root: "B",
          notes: ["B", "D", "F"],
        },
      ]
    )
  })

  test("uses a half-diminished seventh chord on degree seven", () => {
    const chords = getDiatonicSevenths("C")
    const leadingTone = chords[6]

    assert.equal(leadingTone?.romanNumeral, "viiø7")
    assert.equal(leadingTone?.chordId, "half_diminished_7")
    assert.deepEqual(leadingTone?.notes, ["B", "D", "F", "A"])
  })
})

describe("key-aware note spelling", () => {
  test("keeps sharp pitch-class IDs while displaying common flat keys", () => {
    assert.equal(getKeyLabel("A#"), "Bb")
    assert.deepEqual(getMajorScaleSpellings("F"), [
      "F",
      "G",
      "A",
      "Bb",
      "C",
      "D",
      "E",
    ])
    assert.deepEqual(getMajorScaleSpellings("A#"), [
      "Bb",
      "C",
      "D",
      "Eb",
      "F",
      "G",
      "A",
    ])
  })

  test("spells raised scale degrees with the key's diatonic note name", () => {
    assert.equal(getKeyLabel("C#"), "C#")
    assert.deepEqual(getMajorScaleSpellings("C#"), [
      "C#",
      "D#",
      "E#",
      "F#",
      "G#",
      "A#",
      "B#",
    ])
    assert.equal(spellNoteInKey("F", "A#"), "Bb")
    assert.equal(spellNoteInKey("C", "A#"), "A#")
  })
})

describe("CAGED major shapes", () => {
  test("returns all five movable shapes as playable standard-tuning positions", () => {
    const shapes = getCagedMajorShapes("C")

    assert.equal(shapes.length, 5)
    assert.deepEqual(
      shapes.map(({ shape }) => shape),
      ["C", "A", "G", "E", "D"]
    )

    for (const shape of shapes) {
      assert.equal(shape.frets.length, 6)
      assert.ok(shape.positions.some((position) => position.note === "C"))
      assert.ok(
        shape.frets.every(
          (fret) =>
            fret === null ||
            (fret >= DEFAULT_CHORD_VOICING_FRET_RANGE.min &&
              fret <= DEFAULT_CHORD_VOICING_FRET_RANGE.max)
        )
      )
      for (const position of shape.positions) {
        assert.equal(
          getNoteAtFret(standardTuning.strings[position.string], position.fret),
          position.note
        )
      }
    }
  })

  test("resolves one CAGED voicing for every chromatic root", () => {
    const roots: NoteName[] = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ]

    for (const root of roots) {
      const voicings = getCagedMajorVoicings(root, standardTuning)
      assert.equal(voicings.length, 5, `${root} should have all five shapes`)
      assert.deepEqual(
        new Set(voicings.map((voicing) => voicing.cagedShape)),
        new Set(CAGED_SHAPE_IDS)
      )

      for (const voicing of voicings) {
        const chord = getChordById(voicing.chordId)
        assert.ok(chord)
        assert.ok(voicing.activePositions.length > 0)
      }
    }
  })
})
