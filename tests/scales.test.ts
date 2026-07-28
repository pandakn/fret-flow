import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { getModeById, getModeContext, MODES } from "../lib/scales"

describe("modes", () => {
  test("derives the Modes tab from scale records with mode metadata", () => {
    assert.deepEqual(
      MODES.map((mode) => mode.id),
      ["dorian", "phrygian", "lydian", "mixolydian"]
    )
  })

  test("derives Dorian's parent major scale and characteristic tone", () => {
    const dorian = getModeById("dorian")
    assert.ok(dorian)

    assert.deepEqual(getModeContext("C", dorian), {
      parentRoot: "A#",
      parentDegree: 2,
      characteristicNote: "A",
      characteristicInterval: "6",
      chordSymbol: "m7",
      chordLabel: "minor 7",
    })
  })
})
