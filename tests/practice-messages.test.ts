import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { localizePracticeText } from "../lib/i18n/practice-messages"

describe("practice text localization", () => {
  test("translates generated scale labels inside position summaries", () => {
    assert.equal(
      localizePracticeText("th", "F Dorian · positions 3 → 4"),
      "F โดเรียน · ตำแหน่ง 3 → 4"
    )
  })
})
