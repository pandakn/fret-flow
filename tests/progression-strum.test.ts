import assert from "node:assert/strict"
import { test } from "node:test"
import { getDownstrokeNotes } from "../lib/progressions/playback"

test("downstroke plays low to high and ends within the chord", () => {
  const notes = getDownstrokeNotes([330, 110, 220], 1)
  assert.deepEqual(
    notes.map((note) => note.frequency),
    [110, 220, 330]
  )
  assert.deepEqual(
    notes.map((note) => note.delay),
    [0, 0.04, 0.08]
  )
  for (const note of notes) assert.equal(note.delay + note.duration, 1)
})

test("short chords keep every note inside the chord", () => {
  const notes = getDownstrokeNotes([110, 220, 330], 0.03)
  for (const note of notes) {
    assert.ok(note.delay < 0.03)
    assert.ok(note.duration > 0)
  }
})

test("spacing changes the time between notes", () => {
  const fast = getDownstrokeNotes([110, 220], 1, 0.01)
  const slow = getDownstrokeNotes([110, 220], 1, 0.1)
  assert.equal(fast[1].delay, 0.01)
  assert.equal(slow[1].delay, 0.1)
})
