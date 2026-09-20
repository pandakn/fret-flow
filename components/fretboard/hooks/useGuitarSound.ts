"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  getGuitarSampler,
  startGuitarAudio,
} from "@/components/audio/guitarSound"

const NOTE_LIFETIME_MS = 1600

/** Plays short, overlapping guitar-note previews and owns their cleanup. */
export function useGuitarSound() {
  const samplerRef = useRef<Awaited<
    ReturnType<typeof getGuitarSampler>
  > | null>(null)
  const mountedRef = useRef(false)

  const playNote = useCallback(async (frequency: number) => {
    if (!Number.isFinite(frequency) || frequency <= 0) return

    try {
      const tone = await startGuitarAudio()
      if (!mountedRef.current) return

      const sampler = await getGuitarSampler(tone)
      if (!mountedRef.current) return

      samplerRef.current = sampler
      sampler.triggerAttackRelease(
        frequency,
        NOTE_LIFETIME_MS / 1000,
        tone.now()
      )
    } catch (error) {
      console.error("Unable to start guitar audio", error)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      samplerRef.current?.releaseAll()
    }
  }, [])

  return { playNote }
}
