import assert from "node:assert/strict"
import { test } from "node:test"
import type { ScaleRouteSnapshot } from "../types/note-routes"
import {
  createScaleRoutePlaybackController,
  createScaleRouteSchedule,
  type RoutePlaybackAudio,
  type RoutePlaybackClock,
} from "../lib/note-routes/playback"

const snapshot: ScaleRouteSnapshot = {
  selection: {
    root: "A",
    scaleId: "pentatonic_minor",
    tuningId: "standard",
    revision: "pentatonic-v1",
    pairId: "neighbor-boxes",
    placementId: "movable",
    routeId: "shape-a",
    direction: "ascending",
  },
  shapes: [
    { id: "shape-a", minFret: 5, maxFret: 8, coordinates: [] },
    { id: "shape-b", minFret: 7, maxFret: 10, coordinates: [] },
  ],
  occurrences: [
    {
      id: "a",
      string: 0,
      fret: 5,
      note: "A",
      interval: "R",
      midi: 45,
      frequency: 110,
      shapeId: "shape-a",
    },
    {
      id: "b",
      string: 0,
      fret: 8,
      note: "C",
      interval: "b3",
      midi: 48,
      frequency: 130.8128,
      shapeId: "shape-a",
    },
    {
      id: "a-again",
      string: 0,
      fret: 5,
      note: "A",
      interval: "R",
      midi: 45,
      frequency: 110,
      shapeId: "shape-a",
    },
  ],
  transitions: [],
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

class Clock implements RoutePlaybackClock {
  time = 0
  nextId = 0
  timers = new Map<number, { time: number; callback: () => void }>()
  cleared: (() => void)[] = []
  now = () => this.time
  setTimeout = (callback: () => void, seconds: number) => {
    const id = ++this.nextId
    this.timers.set(id, { callback, time: this.time + seconds })
    return id
  }
  clearTimeout = (id: number) => {
    const timer = this.timers.get(id)
    if (timer) this.cleared.push(timer.callback)
    this.timers.delete(id)
  }
  advance(time: number) {
    for (;;) {
      const next = [...this.timers.entries()].sort(
        (a, b) => a[1].time - b[1].time
      )[0]
      if (!next || next[1].time > time + 1e-9) break
      this.time = next[1].time
      this.timers.delete(next[0])
      next[1].callback()
    }
    this.time = time
  }
}

function harness() {
  const clock = new Clock()
  let ready = deferred<RoutePlaybackClock>()
  let samplerReady = deferred<void>()
  const sound: { kind: string; time: number; value: number }[] = []
  let releases = 0
  let disposedClicks = 0
  let gets = 0
  let acquired = 0
  const audio: RoutePlaybackAudio = {
    acquire() {
      acquired += 1
      return {
        start: () => ready.promise,
        getSampler: async () => {
          gets += 1
          await samplerReady.promise
          return {
            triggerAttackRelease: (frequency, _duration, time) =>
              sound.push({ kind: "note", time: time ?? 0, value: frequency }),
          }
        },
        createClick: () => ({
          trigger: (time, beat) =>
            sound.push({ kind: "click", time, value: beat }),
          dispose: () => {
            disposedClicks += 1
          },
        }),
        release: () => {
          releases += 1
        },
      }
    },
  }
  const controller = createScaleRoutePlaybackController(audio)
  controller.configure({ snapshot, bpm: 60, loop: false })
  return {
    controller,
    clock,
    sound,
    ready: async () => {
      ready.resolve(clock)
      samplerReady.resolve()
      await flush()
    },
    contextReady: async () => {
      ready.resolve(clock)
      await flush()
    },
    reject: async () => {
      ready.reject(new Error("audio unavailable"))
      await flush()
    },
    rejectSampler: async () => {
      samplerReady.reject(new Error("samples unavailable"))
      await flush()
    },
    retryReady: () => {
      ready = deferred()
      samplerReady = deferred()
    },
    counts: () => ({ releases, disposedClicks, gets, acquired }),
  }
}

async function flush() {
  for (let index = 0; index < 8; index += 1) await Promise.resolve()
}

test("schedule preserves authored occurrence order and four count-in beats", () => {
  const schedule = createScaleRouteSchedule(snapshot, 60)
  assert.deepEqual(
    schedule.events.map((event) => [event.kind, event.at]),
    [
      ["count-in", 0],
      ["count-in", 1],
      ["count-in", 2],
      ["count-in", 3],
      ["note", 4],
      ["note", 5],
      ["note", 6],
      ["end", 7],
    ]
  )
  assert.deepEqual(
    schedule.events
      .filter((event) => event.kind === "note")
      .map((event) => event.occurrenceId),
    ["a", "b", "a-again"]
  )
  assert.equal(createScaleRouteSchedule(snapshot, 5).duration, 14)
  assert.equal(createScaleRouteSchedule(snapshot, 400).duration, 3.5)
  assert.equal(createScaleRouteSchedule(snapshot, Number.NaN).duration, 7)
})

test("waits for context and samples, then sounds and highlights share an audio clock", async () => {
  const h = harness()
  h.controller.start()
  assert.equal(h.controller.getSnapshot().state, "loading")
  await h.contextReady()
  assert.equal(h.controller.getSnapshot().state, "loading")
  assert.deepEqual(h.sound, [])
  await h.ready()
  assert.equal(h.controller.getSnapshot().state, "count-in")
  h.clock.advance(0.1)
  assert.equal(h.controller.getSnapshot().countInBeat, 1)
  h.clock.advance(4.1)
  assert.deepEqual(h.sound, [
    { kind: "click", time: 0.1, value: 1 },
    { kind: "click", time: 1.1, value: 2 },
    { kind: "click", time: 2.1, value: 3 },
    { kind: "click", time: 3.1, value: 4 },
    { kind: "note", time: 4.1, value: 110 },
  ])
  assert.deepEqual(h.controller.getSnapshot(), {
    state: "playing",
    currentOccurrenceId: "a",
    countInBeat: null,
    error: null,
  })
  h.clock.advance(7.1)
  assert.deepEqual(h.controller.getSnapshot(), {
    state: "stopped",
    currentOccurrenceId: "a-again",
    countInBeat: null,
    error: null,
  })
  assert.deepEqual(h.counts(), {
    acquired: 1,
    gets: 1,
    releases: 1,
    disposedClicks: 1,
  })
})

test("duplicate activation replaces the loading generation and leaves one schedule", async () => {
  const h = harness()
  h.controller.start()
  h.controller.start()
  await h.ready()
  h.clock.advance(4.1)
  assert.equal(h.controller.getSnapshot().currentOccurrenceId, "a")
  assert.equal(h.sound.filter((item) => item.kind === "click").length, 4)
  assert.deepEqual(h.counts(), {
    acquired: 2,
    gets: 1,
    releases: 1,
    disposedClicks: 0,
  })
  h.controller.stop()
  assert.equal(h.clock.timers.size, 0)
})

for (const phase of ["context", "samples", "count-in", "playing"] as const) {
  test(`stop during ${phase} cancels only owned callbacks and retains the last location`, async () => {
    const h = harness()
    const foreign = h.clock.setTimeout(() => {}, 100)
    h.controller.start()
    if (phase === "samples") await h.contextReady()
    if (phase === "count-in" || phase === "playing") await h.ready()
    if (phase === "count-in") h.clock.advance(2.1)
    if (phase === "playing") h.clock.advance(5.1)
    h.controller.stop()
    h.controller.stop()
    await h.ready()
    h.clock.cleared.forEach((callback) => callback())
    h.clock.advance(50)
    assert.deepEqual(h.controller.getSnapshot(), {
      state: "stopped",
      currentOccurrenceId: phase === "playing" ? "b" : null,
      countInBeat: null,
      error: null,
    })
    assert.equal(h.clock.timers.has(foreign), true)
    assert.equal(h.counts().releases, 1)
    assert.equal(
      h.sound.filter((item) => item.kind === "note").length,
      phase === "playing" ? 2 : 0
    )
  })
}

test("restart resets to the route start and stale visual callbacks cannot overwrite it", async () => {
  const h = harness()
  h.controller.start()
  await h.ready()
  h.clock.advance(5.05)
  h.controller.start()
  await flush()
  h.clock.cleared.forEach((callback) => callback())
  assert.equal(h.controller.getSnapshot().currentOccurrenceId, null)
  h.clock.advance(9.15)
  assert.equal(h.controller.getSnapshot().currentOccurrenceId, "a")
  assert.deepEqual(
    h.sound.slice(-5).map((item) => item.kind),
    ["click", "click", "click", "click", "note"]
  )
})

test("loop endpoints insert four clicks without duplicating the last occurrence", async () => {
  const h = harness()
  h.controller.configure({ snapshot, bpm: 60, loop: true })
  h.controller.start()
  await h.ready()
  h.clock.advance(11.1)
  assert.deepEqual(
    h.sound.map((item) => [
      item.kind,
      item.value,
      Math.round(item.time * 10) / 10,
    ]),
    [
      ["click", 1, 0.1],
      ["click", 2, 1.1],
      ["click", 3, 2.1],
      ["click", 4, 3.1],
      ["note", 110, 4.1],
      ["note", 130.8128, 5.1],
      ["note", 110, 6.1],
      ["click", 1, 7.1],
      ["click", 2, 8.1],
      ["click", 3, 9.1],
      ["click", 4, 10.1],
      ["note", 110, 11.1],
    ]
  )
  assert.equal(h.controller.getSnapshot().currentOccurrenceId, "a")
  assert.ok(h.clock.timers.size <= 3)
  h.controller.stop()
})

for (const failure of ["context", "samples"] as const) {
  test(`${failure} rejection is visible and permits retry`, async () => {
    const h = harness()
    h.controller.start()
    if (failure === "context") await h.reject()
    else {
      await h.contextReady()
      await h.rejectSampler()
    }
    assert.equal(h.controller.getSnapshot().state, "error")
    assert.equal(
      h.controller.getSnapshot().error,
      failure === "context" ? "audio unavailable" : "samples unavailable"
    )
    assert.equal(h.counts().releases, 1)
    h.retryReady()
    h.controller.start()
    await h.ready()
    h.clock.advance(4.1)
    assert.equal(h.controller.getSnapshot().currentOccurrenceId, "a")
    h.controller.stop()
  })
}

test("selection changes reset location; interruption and dispose stop without resuming", async () => {
  const h = harness()
  h.controller.start()
  await h.ready()
  h.clock.advance(4.1)
  h.controller.stop()
  assert.equal(h.controller.getSnapshot().currentOccurrenceId, "a")
  h.clock.advance(20)
  assert.equal(h.controller.getSnapshot().state, "stopped")
  h.controller.configure({
    snapshot: {
      ...snapshot,
      selection: { ...snapshot.selection, direction: "descending" },
    },
    bpm: 60,
    loop: false,
  })
  assert.equal(h.controller.getSnapshot().currentOccurrenceId, null)
  h.controller.start()
  await flush()
  h.controller.dispose()
  h.clock.cleared.forEach((callback) => callback())
  h.clock.advance(30)
  assert.equal(h.controller.getSnapshot().state, "stopped")
  assert.equal(h.clock.timers.size, 0)
})
