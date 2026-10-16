import test from "node:test"
import assert from "node:assert/strict"
import {
  resolveScaleRoute,
  classifyRouteAnswer,
  validateScaleRouteSnapshot,
  getRouteQuestionId,
} from "../lib/note-routes"
import type {
  ScaleRouteSelection,
  ScaleRouteSnapshot,
} from "../types/note-routes"

export const selection: ScaleRouteSelection = {
  root: "A",
  scaleId: "pentatonic_minor",
  tuningId: "standard",
  revision: "pentatonic-v1",
  pairId: "neighbor-boxes",
  placementId: "movable",
  routeId: "connection",
  direction: "ascending",
}
const resolve = (
  patch: Partial<ScaleRouteSelection> = {}
): ScaleRouteSnapshot => {
  const result = resolveScaleRoute({ ...selection, ...patch })
  if (result.ok) return result.value
  throw new Error(result.error)
}

test("A minor connection follows authored order and exact pitches", () => {
  const route = resolve()
  assert.deepEqual(
    route.occurrences.map(({ string, fret, note, interval, midi }) => [
      string,
      fret,
      note,
      interval,
      midi,
    ]),
    [
      [0, 5, "A", "R", 45],
      [0, 8, "C", "b3", 48],
      [1, 5, "D", "4", 50],
      [1, 7, "E", "5", 52],
      [2, 5, "G", "b7", 55],
      [2, 7, "A", "R", 57],
      [3, 5, "C", "b3", 60],
      [3, 7, "D", "4", 62],
      [3, 9, "E", "5", 64],
      [4, 8, "G", "b7", 67],
      [4, 10, "A", "R", 69],
      [5, 8, "C", "b3", 72],
      [5, 10, "D", "4", 74],
    ]
  )
  assert.equal(route.occurrences[10].frequency, 440)
  assert.deepEqual(
    route.occurrences.map((o) => o.shapeId),
    Array(8).fill("shape-a").concat(Array(5).fill("shape-b"))
  )
  assert.deepEqual(
    route.transitions.map((t) => t.shift),
    [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
    ]
  )
  assert.deepEqual(
    route.shapes.map((s) => [s.minFret, s.maxFret, s.coordinates.length]),
    [
      [5, 8, 12],
      [7, 10, 12],
    ]
  )
})

test("C major shares A minor geometry but has tonic-specific intervals and identity", () => {
  const minor = resolve()
  const major = resolve({ root: "C", scaleId: "pentatonic_major" })
  assert.deepEqual(major.shapes, minor.shapes)
  assert.deepEqual(
    major.occurrences.map((o) => o.interval),
    ["6", "R", "2", "3", "5", "6", "R", "2", "3", "5", "6", "R", "2"]
  )
  assert.notEqual(
    getRouteQuestionId(major, major.transitions[0].id),
    getRouteQuestionId(minor, minor.transitions[0].id)
  )
})

test("all 24 root and scale combinations resolve complete shapes in bounds", () => {
  for (const root of [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ] as const) {
    for (const scaleId of ["pentatonic_minor", "pentatonic_major"] as const) {
      for (const routeId of ["shape-a", "shape-b", "connection"] as const) {
        const route = resolve({ root, scaleId, routeId })
        assert.equal(
          validateScaleRouteSnapshot(route),
          true,
          `${root} ${scaleId} ${routeId}`
        )
        assert.equal(route.shapes.length, 2)
        assert.equal(route.shapes[0].coordinates.length, 12)
        assert.equal(route.shapes[1].coordinates.length, 12)
        for (const shape of route.shapes) {
          assert.ok(shape.minFret >= 1 && shape.maxFret <= 17)
          assert.deepEqual(
            [...new Set(shape.coordinates.map((c) => c.string))],
            [0, 1, 2, 3, 4, 5]
          )
        }
      }
    }
  }
  assert.equal(resolve({ root: "E" }).shapes[0].minFret, 12)
  assert.equal(resolve({ root: "F" }).shapes[0].minFret, 1)
})

test("descending preserves occurrence identity and reverses transition endpoints", () => {
  const up = resolve()
  const down = resolve({ direction: "descending" })
  assert.deepEqual(down.occurrences, [...up.occurrences].reverse())
  assert.deepEqual(
    down.transitions,
    [...up.transitions]
      .reverse()
      .map((t) => ({ ...t, fromId: t.toId, toId: t.fromId }))
  )
  assert.notEqual(
    getRouteQuestionId(up, up.transitions[0].id),
    getRouteQuestionId(down, up.transitions[0].id)
  )
})

test("answer relationships distinguish location, register, scale, and outside notes", () => {
  const route = resolve()
  const expected = route.occurrences[7]
  assert.equal(
    classifyRouteAnswer(route, expected, { string: 3, fret: 7 }),
    "exact"
  )
  assert.equal(
    classifyRouteAnswer(route, expected, { string: 2, fret: 12 }),
    "same-pitch"
  )
  assert.equal(
    classifyRouteAnswer(route, expected, { string: 1, fret: 5 }),
    "same-note"
  )
  assert.equal(
    classifyRouteAnswer(route, expected, { string: 3, fret: 9 }),
    "scale-tone"
  )
  assert.equal(
    classifyRouteAnswer(route, expected, { string: 3, fret: 8 }),
    "outside-scale"
  )
  assert.equal(
    classifyRouteAnswer(route, expected, { string: 6, fret: 7 }),
    "outside-scale"
  )
})

test("saved snapshots validate without consulting the current catalog revision", () => {
  const historical = structuredClone(resolve())
  Object.assign(historical.selection, {
    revision: "historical-v0",
    pairId: "retired-pair",
    placementId: "retired-placement",
  })
  assert.equal(validateScaleRouteSnapshot(historical), true)
  assert.equal(resolveScaleRoute(historical.selection).ok, false)
  const changedOrder = structuredClone(resolve())
  changedOrder.occurrences.reverse()
  changedOrder.transitions = changedOrder.occurrences
    .slice(1)
    .map((o, i) => ({
      id: `old-${i}`,
      fromId: changedOrder.occurrences[i].id,
      toId: o.id,
      shift: false,
    }))
  assert.equal(validateScaleRouteSnapshot(changedOrder), true)
})

test("repeated coordinate visits remain separate occurrences and questions", () => {
  const route = structuredClone(resolve({ routeId: "shape-a" }))
  const repeated = { ...route.occurrences[1], id: "return-visit" }
  route.transitions.push({
    id: "return",
    fromId: route.occurrences.at(-1)!.id,
    toId: repeated.id,
    shift: false,
  })
  route.occurrences.push(repeated)
  assert.equal(validateScaleRouteSnapshot(route), true)
  assert.notEqual(
    getRouteQuestionId(route, route.transitions[0].id),
    getRouteQuestionId(route, "return")
  )
})

test("boundary rejects malformed snapshots and invalid selections", () => {
  assert.equal(validateScaleRouteSnapshot(resolve()), true)
  for (const mutate of [
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].midi++
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].frequency = Infinity
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].note = "C"
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].interval = "5"
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].fret = -1
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].string = 0.5
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[0].shapeId = "shape-b"
    },
    (r: ScaleRouteSnapshot) => {
      r.occurrences[1].id = r.occurrences[0].id
    },
    (r: ScaleRouteSnapshot) => {
      r.transitions[0].toId = r.occurrences[2].id
    },
    (r: ScaleRouteSnapshot) => {
      r.transitions.pop()
    },
    (r: ScaleRouteSnapshot) => {
      r.transitions[1].id = r.transitions[0].id
    },
    (r: ScaleRouteSnapshot) => {
      r.shapes[0].minFret++
    },
    (r: ScaleRouteSnapshot) => {
      r.shapes[0].coordinates[0].fret = 22
    },
    (r: ScaleRouteSnapshot) => {
      r.shapes[0].coordinates[1] = r.shapes[0].coordinates[0]
    },
  ]) {
    const broken = structuredClone(resolve())
    mutate(broken)
    assert.equal(validateScaleRouteSnapshot(broken), false)
  }
  for (const value of [
    null,
    {},
    [],
    { selection },
    { ...selection, root: "H" },
    { ...selection, revision: "future-v2" },
  ]) {
    assert.equal(validateScaleRouteSnapshot(value), false)
  }
  assert.equal(
    resolveScaleRoute({
      ...selection,
      root: "H",
    } as unknown as ScaleRouteSelection).ok,
    false
  )
})
