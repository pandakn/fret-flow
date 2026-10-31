import assert from "node:assert/strict"
import { describe, test } from "node:test"
import {
  CIRCLE_KEYS,
  SHAPE_GROUPS,
  dailyShapeChallenge,
  masteryKey,
} from "@/lib/practice/shape-mastery"
import { getCagedMajorShapes } from "@/lib/theory/caged"
import {
  createEmptyPracticeDocument,
  importPracticeDocument,
  serializePracticeDocument,
} from "@/lib/practice/storage"

describe("shape mastery", () => {
  test("all CAGED challenges have a complete shape within the displayed frets", () => {
    for (const root of CIRCLE_KEYS) {
      assert.deepEqual(
        getCagedMajorShapes(root, { min: 0, max: 15 })
          .map((shape) => shape.shape)
          .sort(),
        [...SHAPE_GROUPS.caged].sort()
      )
    }
  })

  test("chooses an unpracticed cell before a learning cell", () => {
    const first = dailyShapeChallenge({}, "2026-10-31")
    const entries = {
      [masteryKey("caged", first.shape, first.key)]: {
        status: "learning" as const,
        updatedAt: "2026-10-31T00:00:00Z",
      },
    }
    assert.notDeepEqual(dailyShapeChallenge(entries, "2026-10-31"), first)
  })

  test("exports and imports mastery and rejects malformed data", () => {
    const document = createEmptyPracticeDocument()
    document.shapeMastery = {
      [masteryKey("caged", "E", "C")]: {
        status: "mastered",
        updatedAt: "2026-10-31T00:00:00Z",
      },
    }
    assert.deepEqual(
      importPracticeDocument(serializePracticeDocument(document))?.shapeMastery,
      document.shapeMastery
    )
    assert.equal(
      importPracticeDocument(
        JSON.stringify({
          ...document,
          shapeMastery: { bad: { status: "bad" } },
        })
      ),
      null
    )
  })
})
