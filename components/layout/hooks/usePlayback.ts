"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import type { IntervalName, NoteName } from "@/types/music"
import { CHROMATIC } from "@/lib/notes"

export type PlaybackStep = {
  interval: IntervalName
  /**
   * An exact pitch resolved from an instrument position. When omitted, scale
   * playback derives a pitch from its interval and root as before.
   */
  frequency?: number
}

interface UsePlaybackArgs {
  root: NoteName
  /** Ordered notes to play, expressed relative to the supplied root. */
  sequence: readonly PlaybackStep[]
  bpm: number
  loop: boolean
}

const SEMITONE_BY_INTERVAL: Record<IntervalName, number> = {
  R: 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  b5: 6,
  "#4": 6,
  "5": 7,
  b6: 8,
  "#5": 8,
  "6": 9,
  b7: 10,
  "7": 11,
}

const BASE_HZ = 220

/**
 * Plays an ordered sequence of intervals using Web Audio. The caller owns how
 * the sequence is resolved, which lets scales and voicing-based arpeggios
 * share the same transport behaviour.
 */
export function usePlayback({ root, sequence, bpm, loop }: UsePlaybackArgs) {
  const [playing, setPlaying] = useState(false)
  const [playingInput, setPlayingInput] = useState<{
    root: NoteName
    sequence: readonly PlaybackStep[]
  } | null>(null)
  const loopRef = useRef(loop)
  const activeSessionRef = useRef<{
    id: number
    stop: () => void
  } | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const startRef = useRef<(() => void) | null>(null)
  const sessionIdRef = useRef(0)
  const inputVersionRef = useRef(0)
  const previousInputRef = useRef({ root, sequence })
  const inputRef = useRef({ root, sequence, bpm })

  useLayoutEffect(() => {
    loopRef.current = loop
  }, [loop])

  const invalidate = useCallback(() => {
    sessionIdRef.current += 1
    if (activeSessionRef.current) {
      activeSessionRef.current.stop()
      activeSessionRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    invalidate()
    setPlaying(false)
    setPlayingInput(null)
  }, [invalidate])

  useLayoutEffect(() => {
    const changedMusicalInput =
      previousInputRef.current.root !== root ||
      previousInputRef.current.sequence !== sequence

    inputRef.current = { root, sequence, bpm }
    if (changedMusicalInput) {
      inputVersionRef.current += 1
      previousInputRef.current = { root, sequence }
      // Layout effects run before the browser can paint a new selection, so a
      // held note from the previous root or path cannot leak into it.
      invalidate()
    }
  }, [bpm, invalidate, root, sequence])

  const start = useCallback(() => {
    const {
      root: currentRoot,
      sequence: currentSequence,
      bpm: currentBpm,
    } = inputRef.current

    if (currentSequence.length === 0) return

    const rootIndex = CHROMATIC.indexOf(currentRoot)
    if (rootIndex === -1) return

    const freqs = currentSequence.map(
      ({ interval, frequency }) =>
        frequency ??
        BASE_HZ * Math.pow(2, (rootIndex + SEMITONE_BY_INTERVAL[interval]) / 12)
    )

    type AudioCtxCtor = typeof AudioContext
    type WindowWithAudio = Window & {
      AudioContext?: AudioCtxCtor
      webkitAudioContext?: AudioCtxCtor
    }
    const win = window as unknown as WindowWithAudio
    const AC = win.AudioContext ?? win.webkitAudioContext
    if (!AC) return

    const ctx = new AC()
    ctxRef.current = ctx
    const beat = 60 / Math.max(40, Math.min(200, currentBpm))
    const sessionId = sessionIdRef.current + 1
    sessionIdRef.current = sessionId
    const inputVersion = inputVersionRef.current
    let t = ctx.currentTime + 0.05
    const oscs: { osc: OscillatorNode; gain: GainNode }[] = []

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = "triangle"
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.85)
      osc.start(t)
      osc.stop(t + beat)
      oscs.push({ osc, gain })
      t += beat
    })

    const totalDur = (t - ctx.currentTime + 0.1) * 1000
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const finish = () => {
      try {
        oscs.forEach(({ osc }) => {
          try {
            osc.stop()
          } catch {
            /* already stopped */
          }
        })
        ctx.close()
      } catch {
        /* noop */
      }
      if (ctxRef.current === ctx) ctxRef.current = null
      if (cancelled || activeSessionRef.current?.id !== sessionId) return

      activeSessionRef.current = null
      if (loopRef.current && inputVersionRef.current === inputVersion) {
        startRef.current?.()
        return
      }
      setPlaying(false)
    }

    timer = setTimeout(finish, totalDur)

    const stopSession = () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      try {
        oscs.forEach(({ osc }) => {
          try {
            osc.stop()
          } catch {
            /* already stopped */
          }
        })
        ctx.close()
      } catch {
        /* noop */
      }
      if (ctxRef.current === ctx) ctxRef.current = null
    }

    activeSessionRef.current = { id: sessionId, stop: stopSession }

    setPlayingInput({ root: currentRoot, sequence: currentSequence })
    setPlaying(true)
  }, [])

  useLayoutEffect(() => {
    startRef.current = start
  }, [start])

  const toggle = useCallback(() => {
    if (activeSessionRef.current) {
      stop()
      return
    }
    start()
  }, [start, stop])

  useEffect(() => {
    // This cleanup also clears visible transport state after a changed root or
    // sequence. The layout effect above has already stopped the actual audio
    // before the new selection can paint.
    return stop
  }, [root, sequence, stop])

  return {
    playing:
      playing &&
      playingInput?.root === root &&
      playingInput.sequence === sequence,
    toggle,
    stop,
  }
}
