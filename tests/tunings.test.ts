import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  getStringFrequencyAtFret,
  getStringMidiAtFret,
  getTuningById,
} from "../lib/tunings"

const standardTuning = getTuningById("standard")

if (!standardTuning) {
  throw new Error("Tuning tests require standard tuning.")
}

describe("instrument pitches", () => {
  test("maps standard tuning positions to their actual registers", () => {
    assert.deepEqual(
      standardTuning.strings.map((_, string) =>
        getStringMidiAtFret(standardTuning, string, 0)
      ),
      [40, 45, 50, 55, 59, 64]
    )
    assert.equal(getStringMidiAtFret(standardTuning, 1, 3), 48)
    assert.equal(getStringMidiAtFret(standardTuning, 5, 0), 64)
  })

  test("derives equal-temperament frequencies and rejects invalid positions", () => {
    assert.equal(getStringFrequencyAtFret(standardTuning, 4, 10), 440)
    assert.equal(getStringMidiAtFret(standardTuning, -1, 0), undefined)
    assert.equal(getStringMidiAtFret(standardTuning, 0, -1), undefined)
    assert.equal(getStringFrequencyAtFret(standardTuning, 6, 0), undefined)
  })
})
