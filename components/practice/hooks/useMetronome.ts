"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { clampBpm, secondsPerSubdivision } from "@/lib/practice/metronome"

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SECONDS = 0.1

export function useMetronome({
  initialBpm = 80,
  subdivision = 1,
  beatsPerBar = 4,
}: {
  initialBpm?: number
  subdivision?: number
  beatsPerBar?: number
} = {}) {
  const [bpm, setBpmState] = useState(clampBpm(initialBpm))
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(0)
  const [countingIn, setCountingIn] = useState(false)
  const [gapEveryBars, setGapEveryBars] = useState(0)
  const contextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const nextNoteTimeRef = useRef(0)
  const noteIndexRef = useRef(0)
  const volumeRef = useRef(0.22)

  const scheduleClick = useCallback(
    (time: number, noteIndex: number) => {
      const context = contextRef.current
      if (!context) return
      const notesPerBar = beatsPerBar * subdivision
      const barIndex = Math.floor(noteIndex / notesPerBar)
      const isGapBar =
        gapEveryBars > 0 && barIndex > 0 && (barIndex + 1) % gapEveryBars === 0
      if (isGapBar) return
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const isBeat = noteIndex % subdivision === 0
      const isAccent = noteIndex % (beatsPerBar * subdivision) === 0
      oscillator.frequency.value = isAccent ? 1320 : isBeat ? 880 : 660
      gain.gain.setValueAtTime(volumeRef.current, time)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(time)
      oscillator.stop(time + 0.04)
    },
    [beatsPerBar, gapEveryBars, subdivision]
  )

  const stop = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
    setPlaying(false)
    setBeat(0)
    setCountingIn(false)
  }, [])

  const start = useCallback(async () => {
    const context = contextRef.current ?? new AudioContext()
    contextRef.current = context
    await context.resume()
    noteIndexRef.current = 0
    nextNoteTimeRef.current = context.currentTime + 0.05
    setPlaying(true)
    setCountingIn(true)

    const scheduler = () => {
      while (
        nextNoteTimeRef.current < context.currentTime + SCHEDULE_AHEAD_SECONDS
      ) {
        const index = noteIndexRef.current
        scheduleClick(nextNoteTimeRef.current, index)
        const delay = Math.max(
          0,
          (nextNoteTimeRef.current - context.currentTime) * 1000
        )
        window.setTimeout(
          () => {
            setBeat(Math.floor(index / subdivision) % beatsPerBar)
            if (index >= beatsPerBar * subdivision) setCountingIn(false)
          },
          delay
        )
        nextNoteTimeRef.current += secondsPerSubdivision(bpm, subdivision)
        noteIndexRef.current += 1
      }
    }
    scheduler()
    timerRef.current = window.setInterval(scheduler, LOOKAHEAD_MS)
  }, [beatsPerBar, bpm, scheduleClick, subdivision])

  const setBpm = useCallback((nextBpm: number) => {
    setBpmState(clampBpm(nextBpm))
  }, [])

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.max(0, Math.min(1, volume))
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
      void contextRef.current?.close()
    }
  }, [])

  return {
    bpm,
    setBpm,
    playing,
    beat,
    countingIn,
    gapEveryBars,
    setGapEveryBars,
    start,
    stop,
    setVolume,
  }
}
