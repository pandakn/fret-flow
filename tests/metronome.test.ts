import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  calculateTapTempo,
  getNearestBeatOffset,
  secondsPerSubdivision,
} from "../lib/practice/metronome"

describe("metronome math", () => {
  test("calculates subdivisions and tap tempo", () => {
    assert.equal(secondsPerSubdivision(120, 2), 0.25)
    assert.equal(calculateTapTempo([0, 500, 1000, 1500]), 120)
  })

  test("scores taps against the nearest beat", () => {
    assert.equal(getNearestBeatOffset(1515, 1000, 120), 15)
  })
})
