import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { CHORDS } from "../lib/chords"
import {
  DEFAULT_CHORD_VOICING_FRET_RANGE,
  getChordVoicings,
  isResolvedChordVoicingValid,
  resolveChordVoicing,
  type ChordVoicingTemplate,
} from "../lib/chord-voicings"
import { CHROMATIC } from "../lib/notes"
import { getTuningById } from "../lib/tunings"

const standardTuning = getTuningById("standard")

if (!standardTuning) {
  throw new Error("Standard tuning is required for chord voicing tests.")
}

describe("chord voicings", () => {
  test("resolves the highest fully visible up-neck shape", () => {
    const voicings = getChordVoicings("C", "major", standardTuning)

    assert.deepEqual(
      voicings.find((voicing) => voicing.position === "open")?.frets,
      [null, 3, 2, 0, 1, 0]
    )
    assert.deepEqual(
      voicings.find((voicing) => voicing.position === "barre")?.frets,
      [null, 3, 5, 5, 5, 3]
    )
    assert.deepEqual(
      voicings.find((voicing) => voicing.position === "up-neck")?.frets,
      [8, 10, 10, 9, 8, 8]
    )
  })

  test("resolves an up-neck shape when it fits the rendered range", () => {
    const voicings = getChordVoicings("B", "major", standardTuning)

    assert.deepEqual(
      voicings.find((voicing) => voicing.position === "up-neck")?.frets,
      [19, 21, 21, 20, 19, 19]
    )
  })

  test("resolves the curated E open shape only for its matching root", () => {
    const voicings = getChordVoicings("E", "major", standardTuning)
    assert.deepEqual(
      voicings.find((voicing) => voicing.position === "open")?.frets,
      [0, 2, 2, 1, 0, 0]
    )
  })

  test("resolves curated A, C, D, and G open shapes", () => {
    const shapes = [
      { root: "A", chordId: "minor_7", frets: [null, 0, 2, 0, 1, 0] },
      { root: "C", chordId: "dominant_7", frets: [null, 3, 2, 3, 1, 0] },
      { root: "D", chordId: "minor", frets: [null, null, 0, 2, 3, 1] },
      { root: "G", chordId: "major_7", frets: [3, 2, 0, 0, 0, 2] },
    ] as const

    for (const shape of shapes) {
      assert.deepEqual(
        getChordVoicings(shape.root, shape.chordId, standardTuning).find(
          (voicing) => voicing.position === "open"
        )?.frets,
        shape.frets
      )
    }
  })

  test("returns only valid, six-string, fully visible voicings for every root and chord type", () => {
    for (const root of CHROMATIC) {
      for (const chord of CHORDS) {
        const voicings = getChordVoicings(root, chord.id, standardTuning)
        assert.ok(voicings.length >= 1)
        assert.ok(voicings.some((voicing) => voicing.position === "up-neck"))

        for (const voicing of voicings) {
          assert.equal(voicing.frets.length, 6)
          assert.equal(
            isResolvedChordVoicingValid(voicing, chord, standardTuning),
            true
          )
          assert.ok(
            voicing.frets.every(
              (fret) =>
                fret === null ||
                (fret >= DEFAULT_CHORD_VOICING_FRET_RANGE.min &&
                  fret <= DEFAULT_CHORD_VOICING_FRET_RANGE.max)
            )
          )
        }
      }
    }
  })

  test("annotates only compatible continuous barres", () => {
    const cMajorBarre = getChordVoicings("C", "major", standardTuning).find(
      (voicing) => voicing.position === "barre"
    )
    const cDiminishedBarre = getChordVoicings(
      "C",
      "diminished",
      standardTuning
    ).find((voicing) => voicing.position === "barre")
    const cAugmentedBarre = getChordVoicings(
      "C",
      "augmented",
      standardTuning
    ).find((voicing) => voicing.position === "barre")

    assert.deepEqual(cMajorBarre?.barre, {
      fromString: 1,
      toString: 5,
      fret: 3,
    })
    assert.equal(cDiminishedBarre?.barre, undefined)
    assert.equal(cAugmentedBarre?.barre, undefined)
  })

  test("rejects mismatched active positions and barre metadata", () => {
    const major = CHORDS[0]
    const voicing = getChordVoicings("C", "major", standardTuning).find(
      (candidate) => candidate.position === "barre"
    )

    if (!voicing?.barre) {
      throw new Error("Expected a C major barre voicing.")
    }

    assert.equal(
      isResolvedChordVoicingValid(voicing, major, standardTuning),
      true
    )
    assert.equal(
      isResolvedChordVoicingValid(
        { ...voicing, activePositions: voicing.activePositions.slice(1) },
        major,
        standardTuning
      ),
      false
    )
    assert.equal(
      isResolvedChordVoicingValid(
        {
          ...voicing,
          barre: { ...voicing.barre, fret: voicing.barre.fret + 1 },
        },
        major,
        standardTuning
      ),
      false
    )
  })

  test("rejects incompatible templates and frets outside the requested range", () => {
    const major = CHORDS[0]
    const incompatibleTemplate: ChordVoicingTemplate = {
      id: "minor-open",
      chordId: "minor",
      label: "Minor open shape",
      position: "open",
      tuningId: "standard",
      kind: "curated-open",
      root: "E",
      frets: [0, 2, 2, 0, 0, 0],
    }
    const highTemplate: ChordVoicingTemplate = {
      id: "high-major",
      chordId: "major",
      label: "High major shape",
      position: "up-neck",
      tuningId: "standard",
      kind: "root-anchored",
      anchorString: 0,
      octave: 2,
      fretOffsets: [0, 2, 2, 1, 0, 0],
    }

    assert.equal(
      resolveChordVoicing(incompatibleTemplate, "E", major, standardTuning),
      undefined
    )
    assert.equal(
      resolveChordVoicing(highTemplate, "C", major, standardTuning, {
        min: 20,
        max: 21,
      }),
      undefined
    )
  })
})
