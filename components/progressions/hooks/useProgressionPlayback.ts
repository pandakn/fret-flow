"use client"

import type { Part } from "tone"
import type { NoteName } from "@/types/music"
import { getGuitarSampler } from "@/components/audio/guitarSound"
import { getMetaPiano } from "@/components/audio/metaPiano"
import { startEpAudio, getEpInstruments } from "@/components/audio/ePianoSound"
import {
  getProgressionLengthBeats,
  type PlayableProgression,
} from "@/lib/progressions/catalog"
import {
  buildPlaybackPlan,
  getDownstrokeNotes,
  type PianoRhythm,
} from "@/lib/progressions/playback"
import { useCallback, useEffect, useRef, useState } from "react"

export type ChordInstrument = "piano" | "metaPiano" | "guitar"

export type PlaybackRequest = {
  instrument: ChordInstrument
  progression: PlayableProgression
  key: NoteName
  bpm: number
  loop: boolean
  pianoRhythm: PianoRhythm
}

/**
 * Formats a Transport position from a beat number. Beats are quarter notes in
 * 4/4; fractional quarters resolve to sixteenths (0.5 → second sixteenth) so
 * off-beats pick up `Transport.swing` on an 8n grid.
 */
const beatPosition = (beat: number): string => {
  const bar = Math.floor(beat / 4)
  const inBar = beat - bar * 4
  const whole = Math.floor(inBar)
  const sixteenth = Math.round((inBar - whole) * 4) % 4
  return `${bar}:${whole}:${sixteenth}`
}

/**
 * Plays a progression with EP chords and bass through Tone's Transport, so
 * looping and swing come for free. The request-driven API lets one engine
 * serve both the library and the ear-training quiz: every new request replaces
 * the running session, and the previous audio is torn down before the new one
 * starts.
 */
export function useProgressionPlayback() {
  const [playing, setPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const sessionRef = useRef<{ id: number; stop: () => void } | null>(null)
  const activeIdRef = useRef(0)
  const strumIntervalRef = useRef(40)

  const setStrumInterval = useCallback((milliseconds: number) => {
    strumIntervalRef.current = milliseconds
  }, [])

  const stop = useCallback(() => {
    // Bumping the id also cancels a session that is still starting up.
    activeIdRef.current += 1
    const session = sessionRef.current
    sessionRef.current = null
    if (session) session.stop()
    setCurrentStep(-1)
    setPlaying(false)
  }, [])

  const play = useCallback(
    (request: PlaybackRequest) => {
      const { progression, key, bpm, loop, pianoRhythm, instrument } = request

      // A new request always wins over whatever is sounding.
      stop()

      const sessionId = activeIdRef.current + 1
      activeIdRef.current = sessionId
      const isCurrent = () => activeIdRef.current === sessionId
      setPlaying(true)

      void (async () => {
        try {
          const tone = await startEpAudio()
          if (!isCurrent()) return

          const instruments = await getEpInstruments(tone)
          if (!isCurrent()) return
          const guitar =
            instrument === "guitar" ? await getGuitarSampler(tone) : null
          if (!isCurrent()) return
          const metaPiano =
            instrument === "metaPiano" ? await getMetaPiano(tone) : null
          if (!isCurrent()) return
          const playChord = (
            frequencies: number[],
            duration: number,
            time: number,
            velocity?: number
          ) => {
            if (guitar)
              getDownstrokeNotes(
                frequencies,
                duration,
                strumIntervalRef.current / 1000
              ).forEach((note) =>
                guitar.triggerAttackRelease(
                  note.frequency,
                  note.duration,
                  time + note.delay,
                  velocity
                )
              )
            else if (metaPiano)
              metaPiano.triggerAttackRelease(
                frequencies,
                duration,
                time,
                velocity
              )
            else
              instruments.ep.triggerAttackRelease(
                frequencies,
                duration,
                time,
                velocity
              )
          }

          const plan = buildPlaybackPlan(progression, key, pianoRhythm)
          const totalBeats = getProgressionLengthBeats(progression)
          const parts: Part[] = []

          const transport = tone.getTransport()
          transport.stop()
          transport.cancel(0)
          transport.bpm.value = bpm
          transport.swing = progression.swing ? 0.55 : 0
          transport.swingSubdivision = "8n"
          if (loop) {
            transport.loopStart = 0
            transport.loopEnd = `${totalBeats / 4}:0:0`
            transport.loop = true
          } else {
            transport.loop = false
          }

          const secondsPerBeat = () => 60 / transport.bpm.value

          const chordPart = new tone.Part<{
            time: string
            stepIndex: number
            frequencies: number[]
            durationBeats: number
          }>(
            (time, value) => {
              playChord(
                value.frequencies,
                value.durationBeats * secondsPerBeat(),
                time
              )
              setCurrentStep(value.stepIndex)
            },
            plan.chordEvents.map((event) => ({
              time: beatPosition(event.beat),
              stepIndex: event.stepIndex,
              frequencies: event.frequencies,
              durationBeats: event.durationBeats,
            }))
          )
          chordPart.start(0)
          parts.push(chordPart)

          const bassPart = new tone.Part<{
            time: string
            frequency: number
            durationBeats: number
          }>(
            (time, value) => {
              instruments.bass.triggerAttackRelease(
                value.frequency,
                value.durationBeats * secondsPerBeat() * 0.92,
                time
              )
            },
            plan.bassEvents.map((event) => ({
              time: beatPosition(event.beat),
              frequency: event.frequency,
              durationBeats: event.durationBeats,
            }))
          )
          bassPart.start(0)
          parts.push(bassPart)

          if (plan.stabEvents.length > 0) {
            const stabPart = new tone.Part<{
              time: string
              stepIndex: number
              frequencies: number[]
            }>(
              (time, value) => {
                playChord(value.frequencies, 0.5 * secondsPerBeat(), time, 0.7)
              },
              plan.stabEvents.map((event) => ({
                time: beatPosition(event.beat),
                stepIndex: event.stepIndex,
                frequencies: event.frequencies,
              }))
            )
            stabPart.start(0)
            parts.push(stabPart)
          }

          if (!isCurrent()) {
            parts.forEach((part) => part.dispose())
            return
          }

          sessionRef.current = {
            id: sessionId,
            stop: () => {
              parts.forEach((part) => part.dispose())
              try {
                transport.stop()
                transport.cancel(0)
                transport.swing = 0
              } catch {
                // AudioContext may already be closing.
              }
              instruments.releaseAll()
              guitar?.releaseAll()
              metaPiano?.releaseAll()
            },
          }

          if (!loop) {
            transport.scheduleOnce(() => {
              if (!isCurrent()) return
              stop()
            }, beatPosition(totalBeats))
          }

          transport.position = 0
          transport.start("+0.08")
          setPlaying(true)
          setCurrentStep(-1)
        } catch (error) {
          console.error("Unable to start progression playback", error)
          if (!isCurrent()) return
          sessionRef.current = null
          setPlaying(false)
          setCurrentStep(-1)
        }
      })()
    },
    [stop]
  )

  useEffect(() => {
    return () => {
      activeIdRef.current += 1
      const session = sessionRef.current
      sessionRef.current = null
      if (session) session.stop()
    }
  }, [])

  return {
    playing,
    currentStep,
    play,
    stop,
    setStrumInterval,
  }
}
