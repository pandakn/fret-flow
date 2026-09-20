import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { CHORDS } from "../lib/chords"
import {
  EXPLORER_FRET_RANGE,
  getActiveFretNotesInPitchOrder,
  getFretNotes,
} from "../lib/fretboard"
import { getScaleById } from "../lib/scales"
import { getTuningById } from "../lib/tunings"
import { getStringFrequencyAtFret } from "../lib/tunings"
import { useFretboard } from "../components/fretboard/hooks/useFretboard"

const standardTuning = getTuningById("standard")

if (!standardTuning) {
  throw new Error("Standard tuning is required for fretboard tests.")
}

describe("fretboard tone maps", () => {
  test("preserves the C major scale tone map", () => {
    const major = getScaleById("major")

    if (!major) {
      throw new Error("Major scale is required for fretboard tests.")
    }

    const activeNotes = getFretNotes({
      root: "C",
      pattern: major,
      tuning: standardTuning.strings,
      fretRange: { min: 0, max: 21 },
    }).filter((note) => note.isActive)

    assert.deepEqual(
      [...new Set(activeNotes.map((note) => note.note))].sort(),
      ["A", "B", "C", "D", "E", "F", "G"]
    )
    assert.deepEqual(
      [...new Set(activeNotes.map((note) => note.interval))].sort(),
      ["2", "3", "4", "5", "6", "7", "R"]
    )
  })

  test("maps C major chord tones across every string", () => {
    const major = CHORDS.find((chord) => chord.id === "major")

    if (!major) {
      throw new Error("Major chord is required for fretboard tests.")
    }

    const notes = getFretNotes({
      root: "C",
      pattern: major,
      tuning: standardTuning.strings,
      fretRange: { min: 0, max: 21 },
    })
    const activeNotes = notes.filter((note) => note.isActive)

    assert.ok(activeNotes.length > 0)
    assert.deepEqual(
      [...new Set(activeNotes.map((note) => note.note))].sort(),
      ["C", "E", "G"]
    )
    assert.deepEqual(
      [...new Set(activeNotes.map((note) => note.interval))].sort(),
      ["3", "5", "R"]
    )
    assert.equal(
      activeNotes
        .filter((note) => note.note === "C")
        .every((note) => note.isRoot),
      true
    )
  })

  test("orders every highlighted scale position by sounding pitch", () => {
    const major = getScaleById("major")

    if (!major) {
      throw new Error("Major scale is required for fretboard tests.")
    }

    const highlightedNotes = getFretNotes({
      root: "C",
      pattern: major,
      tuning: standardTuning.strings,
      fretRange: EXPLORER_FRET_RANGE,
    }).filter((note) => note.isActive)
    const orderedNotes = getActiveFretNotesInPitchOrder({
      root: "C",
      pattern: major,
      tuning: standardTuning,
    })

    assert.equal(orderedNotes.length, highlightedNotes.length)
    assert.deepEqual(
      new Set(orderedNotes.map((note) => `${note.string}-${note.fret}`)),
      new Set(highlightedNotes.map((note) => `${note.string}-${note.fret}`))
    )
    assert.equal(
      orderedNotes.every((note, index) => {
        if (index === 0) return true

        const previous = orderedNotes[index - 1]
        const previousFrequency = getStringFrequencyAtFret(
          standardTuning,
          previous.string,
          previous.fret
        )
        const frequency = getStringFrequencyAtFret(
          standardTuning,
          note.string,
          note.fret
        )

        return (
          previousFrequency !== undefined &&
          frequency !== undefined &&
          previousFrequency <= frequency
        )
      }),
      true
    )
  })

  test("returns empty string grids for a missing pattern or unknown tuning", () => {
    const missingPattern = useFretboard({
      tuningId: "standard",
      fretRange: { min: 0, max: 21 },
    })
    const unknownTuning = useFretboard({
      pattern: CHORDS[0],
      tuningId: "unknown",
      fretRange: { min: 0, max: 21 },
    })

    assert.deepEqual(missingPattern.fretNotesByString, [[], [], [], [], [], []])
    assert.deepEqual(unknownTuning.fretNotesByString, [[], [], [], [], [], []])
  })
})
