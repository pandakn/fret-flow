import type { ScaleRouteSnapshot } from "@/types/note-routes"

export type RoutePlaybackState =
  | "stopped"
  | "loading"
  | "count-in"
  | "playing"
  | "error"
export type RoutePlaybackSnapshot = {
  state: RoutePlaybackState
  currentOccurrenceId: string | null
  countInBeat: number | null
  error: string | null
}
export type RoutePlaybackEvent =
  | { kind: "count-in"; at: number; beat: number }
  | { kind: "note"; at: number; occurrenceId: string; frequency: number }
  | { kind: "end"; at: number }
export type RoutePlaybackSchedule = {
  events: RoutePlaybackEvent[]
  duration: number
  beatSeconds: number
}
export type RoutePlaybackClock = {
  now: () => number
  setTimeout: (callback: () => void, seconds: number) => number
  clearTimeout: (id: number) => void
}
export type RoutePlaybackAudio = {
  acquire: () => {
    start: () => Promise<RoutePlaybackClock>
    getSampler: () => Promise<{
      triggerAttackRelease: (
        frequency: number,
        duration: number,
        time?: number
      ) => void
    }>
    createClick: () => {
      trigger: (time: number, beat: number) => void
      dispose: () => void
    }
    release: () => void
  }
}

export const createScaleRouteSchedule = (
  snapshot: ScaleRouteSnapshot,
  bpm: number
): RoutePlaybackSchedule => {
  const bounded = Number.isFinite(bpm) ? Math.max(30, Math.min(120, bpm)) : 60
  const beatSeconds = 60 / bounded
  const events: RoutePlaybackEvent[] = [
    ...[1, 2, 3, 4].map(
      (beat): RoutePlaybackEvent => ({
        kind: "count-in",
        at: (beat - 1) * beatSeconds,
        beat,
      })
    ),
    ...snapshot.occurrences.map(
      (occurrence, index): RoutePlaybackEvent => ({
        kind: "note",
        at: (index + 4) * beatSeconds,
        occurrenceId: occurrence.id,
        frequency: occurrence.frequency,
      })
    ),
    { kind: "end", at: (snapshot.occurrences.length + 4) * beatSeconds },
  ]
  return {
    events,
    beatSeconds,
    duration: (snapshot.occurrences.length + 4) * beatSeconds,
  }
}

export const createScaleRoutePlaybackController = (
  audio: RoutePlaybackAudio
) => {
  let config: {
    snapshot: ScaleRouteSnapshot
    bpm: number
    loop: boolean
  } | null = null
  let state: RoutePlaybackSnapshot = {
    state: "stopped",
    currentOccurrenceId: null,
    countInBeat: null,
    error: null,
  }
  let generation = 0
  let active: ReturnType<RoutePlaybackAudio["acquire"]> | null = null
  let releaseActive: (() => void) | null = null
  let clock: RoutePlaybackClock | null = null
  let sampler: Awaited<
    ReturnType<ReturnType<RoutePlaybackAudio["acquire"]>["getSampler"]>
  > | null = null
  let click: ReturnType<
    ReturnType<RoutePlaybackAudio["acquire"]>["createClick"]
  > | null = null
  let timers: number[] = []
  const listeners = new Set<(snapshot: RoutePlaybackSnapshot) => void>()
  let closed = false
  const publish = (next: RoutePlaybackSnapshot) => {
    state = next
    listeners.forEach((listener) => listener(state))
  }
  const clearOwned = () => {
    if (clock) timers.forEach((id) => clock!.clearTimeout(id))
    timers = []
    click?.dispose()
    click = null
    if (active && (clock || sampler)) releaseActive?.()
    active = null
    releaseActive = null
    sampler = null
    clock = null
  }
  const stop = () => {
    generation += 1
    clearOwned()
    publish({
      state: "stopped",
      currentOccurrenceId: state.currentOccurrenceId,
      countInBeat: null,
      error: null,
    })
  }
  const configure = (next: {
    snapshot: ScaleRouteSnapshot
    bpm: number
    loop: boolean
  }) => {
    const boundedBpm = Number.isFinite(next.bpm)
      ? Math.max(30, Math.min(120, next.bpm))
      : 60
    const changedSelection =
      config !== null &&
      JSON.stringify(config.snapshot.selection) !==
        JSON.stringify(next.snapshot.selection)
    const changedSettings =
      config !== null &&
      (config.bpm !== boundedBpm || config.loop !== next.loop)
    if (changedSelection || changedSettings) {
      generation += 1
      clearOwned()
      publish({
        state: "stopped",
        currentOccurrenceId: changedSelection
          ? null
          : state.currentOccurrenceId,
        countInBeat: null,
        error: null,
      })
    }
    config = { ...next, bpm: boundedBpm }
  }
  const start = () => {
    if (!config || closed) return
    generation += 1
    const ownGeneration = generation
    clearOwned()
    const selected = config
    publish({
      state: "loading",
      currentOccurrenceId: null,
      countInBeat: null,
      error: null,
    })
    const resource = audio.acquire()
    let released = false
    const releaseResource = () => {
      if (!released) {
        released = true
        resource.release()
      }
    }
    active = resource
    releaseActive = releaseResource
    const scheduleCycle = (
      baseTime: number,
      schedule: RoutePlaybackSchedule
    ) => {
      if (!clock || !sampler || !click || ownGeneration !== generation) return
      const audioClock = clock
      const notePlayer = sampler
      const clickPlayer = click
      const scheduleEvent = (event: RoutePlaybackEvent, at: number) => {
        let timerId = 0
        timerId = audioClock.setTimeout(
          () => {
            timers = timers.filter((id) => id !== timerId)
            if (ownGeneration !== generation || closed) return
            if (event.kind === "count-in") {
              clickPlayer.trigger(at, event.beat)
              publish({
                state: "count-in",
                currentOccurrenceId: state.currentOccurrenceId,
                countInBeat: event.beat,
                error: null,
              })
            } else if (event.kind === "note") {
              notePlayer.triggerAttackRelease(
                event.frequency,
                Math.min(schedule.beatSeconds * 0.75, 1.5),
                at
              )
              publish({
                state: "playing",
                currentOccurrenceId: event.occurrenceId,
                countInBeat: null,
                error: null,
              })
            } else if (selected.loop) {
              scheduleCycle(baseTime + schedule.duration, schedule)
            } else {
              clearOwned()
              publish({
                state: "stopped",
                currentOccurrenceId: state.currentOccurrenceId,
                countInBeat: null,
                error: null,
              })
            }
          },
          Math.max(0, at - audioClock.now())
        )
        timers.push(timerId)
      }
      for (const event of schedule.events)
        scheduleEvent(event, baseTime + event.at)
    }
    void (async () => {
      try {
        const readyClock = await resource.start()
        if (ownGeneration !== generation || closed) {
          releaseResource()
          if (active === resource) {
            active = null
            releaseActive = null
          }
          return
        }
        clock = readyClock
        const readySampler = await resource.getSampler()
        if (ownGeneration !== generation || closed) {
          releaseResource()
          if (active === resource) {
            active = null
            releaseActive = null
          }
          return
        }
        sampler = readySampler
        click = resource.createClick()
        const schedule = createScaleRouteSchedule(
          selected.snapshot,
          selected.bpm
        )
        publish({
          state: "count-in",
          currentOccurrenceId: null,
          countInBeat: 0,
          error: null,
        })
        scheduleCycle(readyClock.now() + 0.1, schedule)
      } catch (error) {
        if (ownGeneration !== generation) {
          releaseResource()
          return
        }
        clearOwned()
        releaseResource()
        publish({
          state: "error",
          currentOccurrenceId: state.currentOccurrenceId,
          countInBeat: null,
          error:
            error instanceof Error ? error.message : "Audio could not start.",
        })
      }
    })()
  }
  return {
    configure,
    start,
    stop,
    dispose: () => {
      stop()
      closed = true
      listeners.clear()
    },
    getSnapshot: () => state,
    subscribe: (listener: (snapshot: RoutePlaybackSnapshot) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
