"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { NoteName } from "@/types/music"
import { CHROMATIC } from "@/lib/notes"
import { SCALES } from "@/lib/scales"

interface UsePlaybackArgs {
  root: NoteName
  scaleId: string
  bpm: number
  loop: boolean
}

const SEMITONE_BY_INTERVAL: Record<string, number> = {
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

export function usePlayback({ root, scaleId, bpm, loop }: UsePlaybackArgs) {
  const [playing, setPlaying] = useState(false)
  const loopRef = useRef(loop)
  const stopRef = useRef<(() => void) | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const toggleRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    loopRef.current = loop
  }, [loop])

  const stop = useCallback(() => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (playing) {
      stop()
      return
    }

    const scale = SCALES.find((s) => s.id === scaleId)
    if (!scale) return

    const rootIndex = CHROMATIC.indexOf(root)
    const intervals = scale.intervals.map((i) => SEMITONE_BY_INTERVAL[i] ?? 0)
    const freqs = intervals.map(
      (iv) => BASE_HZ * Math.pow(2, (rootIndex + iv) / 12)
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
    const beat = 60 / Math.max(40, Math.min(200, bpm))
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
      if (cancelled) return
      if (loopRef.current) {
        setPlaying(false)
        queueMicrotask(() => {
          if (!cancelled) toggleRef.current?.()
        })
      } else {
        setPlaying(false)
      }
    }

    timer = setTimeout(finish, totalDur)

    stopRef.current = () => {
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

    setPlaying(true)
  }, [playing, root, scaleId, bpm, stop])

  useEffect(() => {
    toggleRef.current = toggle
  }, [toggle])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { playing, toggle, stop }
}
