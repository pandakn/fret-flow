import assert from "node:assert/strict"
import { test } from "node:test"
import { noteRouteCopy, routeText } from "../lib/i18n/note-routes"

test("guided route English and Thai copy have matching complete keys", () => {
  assert.deepEqual(
    Object.keys(noteRouteCopy.en).sort(),
    Object.keys(noteRouteCopy.th).sort()
  )
  for (const [key, value] of Object.entries(noteRouteCopy.th))
    assert.ok(value.trim(), `${key} has Thai copy`)
  assert.equal(
    routeText("en", "candidate", { string: 6, fret: 8 }),
    "String 6, fret 8"
  )
  assert.equal(
    routeText("th", "candidate", { string: 6, fret: 8 }),
    "สาย 6 เฟรต 8"
  )
  assert.match(routeText("th", "samePitch"), /เสียงเดียวกัน/)
})
