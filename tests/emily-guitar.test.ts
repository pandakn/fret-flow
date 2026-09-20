import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  createEmilyGuitarSampleMap,
  EMILY_GUITAR_NOTE_ANCHORS,
  getEmilyGuitarVelocityLayer,
} from "../components/audio/emilyGuitar"

describe("Emilyguitar sample mapping", () => {
  test("keeps the SFZ pitch centers in the sampler map", () => {
    const samples = createEmilyGuitarSampleMap("mf", 2)

    assert.equal(EMILY_GUITAR_NOTE_ANCHORS.length, 18)
    assert.equal(samples[37], "db2_mf_rr2.wav")
    assert.equal(samples[81], "a5_mf_rr2.wav")
    assert.equal(samples[86], "d6_mf_rr2.wav")
  })

  test("selects the four SFZ velocity ranges", () => {
    assert.equal(getEmilyGuitarVelocityLayer(0), "p")
    assert.equal(getEmilyGuitarVelocityLayer(40 / 127), "p")
    assert.equal(getEmilyGuitarVelocityLayer(41 / 127), "mp")
    assert.equal(getEmilyGuitarVelocityLayer(80 / 127), "mp")
    assert.equal(getEmilyGuitarVelocityLayer(81 / 127), "mf")
    assert.equal(getEmilyGuitarVelocityLayer(120 / 127), "mf")
    assert.equal(getEmilyGuitarVelocityLayer(121 / 127), "f")
    assert.equal(getEmilyGuitarVelocityLayer(1), "f")
  })
})
