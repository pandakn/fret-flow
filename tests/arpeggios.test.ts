import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { resolveArpeggio } from "../lib/arpeggios"
import type { FretOrMute, FretSlots } from "../lib/chord-voicings"
import { getChordById } from "../lib/chords"
import { getChordVoicings } from "../lib/chord-voicings"
import { getTuningById } from "../lib/tunings"
import { getStringFrequencyAtFret } from "../lib/tunings"

const standardTuning = getTuningById("standard")
const major = getChordById("major")
const minor = getChordById("minor")
const majorSeventh = getChordById("major_7")

if (!standardTuning || !major || !minor || !majorSeventh) {
  throw new Error("Arpeggio tests require standard tuning and chord types.")
}

const getVoicing = (root: "C" | "D", chordId: string) => {
  const voicing = getChordVoicings(root, chordId, standardTuning).find(
    (candidate) => candidate.position === "open"
  )

  if (!voicing) {
    throw new Error(`Expected an open ${root} ${chordId} voicing.`)
  }

  return voicing
}

type StringIndex = 0 | 1 | 2 | 3 | 4 | 5

const replaceFret = (
  frets: FretSlots,
  string: StringIndex,
  fret: FretOrMute
): FretSlots => {
  switch (string) {
    case 0:
      return [fret, frets[1], frets[2], frets[3], frets[4], frets[5]]
    case 1:
      return [frets[0], fret, frets[2], frets[3], frets[4], frets[5]]
    case 2:
      return [frets[0], frets[1], fret, frets[3], frets[4], frets[5]]
    case 3:
      return [frets[0], frets[1], frets[2], fret, frets[4], frets[5]]
    case 4:
      return [frets[0], frets[1], frets[2], frets[3], fret, frets[5]]
    case 5:
      return [frets[0], frets[1], frets[2], frets[3], frets[4], fret]
  }
}

describe("arpeggios", () => {
  test("resolves major, minor, and seventh voicings with their chord intervals", () => {
    const cases = [
      {
        voicing: getVoicing("C", "major"),
        chord: major,
        notes: ["C", "E", "G", "C", "E"],
        intervals: ["R", "3", "5", "R", "3"],
      },
      {
        voicing: getVoicing("D", "minor"),
        chord: minor,
        notes: ["D", "A", "D", "F"],
        intervals: ["R", "5", "R", "b3"],
      },
      {
        voicing: getVoicing("C", "major_7"),
        chord: majorSeventh,
        notes: ["C", "E", "G", "B", "E"],
        intervals: ["R", "3", "5", "7", "3"],
      },
    ] as const

    for (const arpeggioCase of cases) {
      const arpeggio = resolveArpeggio(
        arpeggioCase.voicing,
        arpeggioCase.chord,
        standardTuning,
        "ascending"
      )

      assert.ok(arpeggio)
      assert.deepEqual(
        arpeggio.steps.map((step) => step.note),
        arpeggioCase.notes
      )
      assert.deepEqual(
        arpeggio.steps.map((step) => step.interval),
        arpeggioCase.intervals
      )
      assert.deepEqual(
        arpeggio.steps.map((step) => step.index),
        arpeggioCase.notes.map((_, index) => index + 1)
      )
    }
  })

  test("orders paths ascending, descending, and up-and-down without repeated endpoints", () => {
    const voicing = getVoicing("C", "major")

    const ascending = resolveArpeggio(
      voicing,
      major,
      standardTuning,
      "ascending"
    )
    const descending = resolveArpeggio(
      voicing,
      major,
      standardTuning,
      "descending"
    )
    const upAndDown = resolveArpeggio(
      voicing,
      major,
      standardTuning,
      "upAndDown"
    )

    assert.ok(ascending && descending && upAndDown)
    assert.deepEqual(
      ascending.steps.map((step) => step.string),
      [1, 2, 3, 4, 5]
    )
    assert.deepEqual(
      descending.steps.map((step) => step.string),
      [5, 4, 3, 2, 1]
    )
    assert.deepEqual(
      upAndDown.steps.map((step) => step.string),
      [1, 2, 3, 4, 5, 4, 3, 2]
    )
    assert.deepEqual(
      upAndDown.steps.map((step) => step.index),
      [1, 2, 3, 4, 5, 6, 7, 8]
    )
  })

  test("resolves each path step to the selected voicing's actual pitch", () => {
    const voicing = getVoicing("C", "major")
    const arpeggio = resolveArpeggio(
      voicing,
      major,
      standardTuning,
      "ascending"
    )

    assert.ok(arpeggio)
    assert.deepEqual(
      arpeggio.steps.map((step) => step.frequency),
      arpeggio.steps.map((step) =>
        getStringFrequencyAtFret(standardTuning, step.string, step.fret)
      )
    )
    assert.deepEqual(
      arpeggio.steps.map((step) => step.frequency),
      [
        130.8127826502993, 164.81377845643496, 195.99771799087463,
        261.6255653005986, 329.6275569128699,
      ]
    )
  })

  test("rejects invalid voicings, non-chord tones, and paths without a root", () => {
    const voicing = getVoicing("C", "major")

    assert.equal(
      resolveArpeggio(
        { ...voicing, activePositions: voicing.activePositions.slice(1) },
        major,
        standardTuning,
        "ascending"
      ),
      undefined
    )

    const nonChordToneFrets = replaceFret(voicing.frets, 2, 1)
    assert.equal(
      resolveArpeggio(
        {
          ...voicing,
          frets: nonChordToneFrets,
          activePositions: voicing.activePositions.map((position) =>
            position.string === 2 ? { ...position, fret: 1 } : position
          ),
        },
        major,
        standardTuning,
        "ascending"
      ),
      undefined
    )

    const noRootFrets = replaceFret(replaceFret(voicing.frets, 1, 7), 4, 5)
    assert.equal(
      resolveArpeggio(
        {
          ...voicing,
          frets: noRootFrets,
          activePositions: voicing.activePositions.map((position) => {
            if (position.string === 1) return { ...position, fret: 7 }
            if (position.string === 4) return { ...position, fret: 5 }
            return position
          }),
        },
        major,
        standardTuning,
        "ascending"
      ),
      undefined
    )
  })

  test("rejects paths that exceed the rendered chord-voicing fret range", () => {
    const voicing = getVoicing("C", "major")
    const beyondRangeFrets = replaceFret(voicing.frets, 1, 27)

    assert.equal(
      resolveArpeggio(
        {
          ...voicing,
          frets: beyondRangeFrets,
          activePositions: voicing.activePositions.map((position) =>
            position.string === 1 ? { ...position, fret: 27 } : position
          ),
        },
        major,
        standardTuning,
        "ascending"
      ),
      undefined
    )
  })
})
