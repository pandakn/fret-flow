import type { NoteName } from "@/types/music"
import { CHROMATIC } from "../notes"
import {
  getChordToneSpec,
  getStepRootNote,
  type PlayableProgression,
  type ProgressionStep,
} from "./catalog"

const NOTE_TO_MIDI_SEMITONE: Record<NoteName, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
}

/** MIDI note number for a note placed in the given octave (C4 = 60, A4 = 69). */
export const noteToMidi = (note: NoteName, octave: number): number =>
  (octave + 1) * 12 + NOTE_TO_MIDI_SEMITONE[note]

export const getNoteFrequency = (note: NoteName, octave: number): number =>
  440 * Math.pow(2, (noteToMidi(note, octave) - 69) / 12)

/** Resolves the individual chord-tone notes of a step against the selected key. */
export const getStepChordNotes = (
  step: ProgressionStep,
  key: NoteName
): NoteName[] => {
  const spec = getChordToneSpec(step.toneId)
  if (!spec) throw new Error(`Unknown chord tone stack: ${step.toneId}`)

  const root = getStepRootNote(step, key)
  const rootIndex = CHROMATIC.indexOf(root)

  return spec.tones.map((tone) => {
    const index = (((rootIndex + tone) % 12) + 12) % 12
    return CHROMATIC[index]
  })
}

export type ChordEvent = {
  stepIndex: number
  beat: number
  durationBeats: number
  frequencies: number[]
}

export type BassEvent = {
  beat: number
  durationBeats: number
  frequency: number
}

export type PlaybackPlan = {
  chordEvents: ChordEvent[]
  stabEvents: ChordEvent[]
  bassEvents: BassEvent[]
  totalBeats: number
}

export type PianoRhythm = "sustained" | "quarter_notes"

/** Windows hold a full octave, always starting on C. */
const CHORD_ROOT_LOW_MIDI = 48 // C3
const BASS_ROOT_LOW_MIDI = 36 // C2

const pickRootMidi = (root: NoteName, lowest: number): number =>
  lowest + NOTE_TO_MIDI_SEMITONE[root]

const shuffleStab = ({
  beat,
  durationBeats,
  frequencies,
  stepIndex,
}: ChordEvent): ChordEvent | undefined => {
  const stabBeat = beat + durationBeats - 0.5
  if (stabBeat <= beat) return undefined
  return { stepIndex, beat: stabBeat, durationBeats: 0.5, frequencies }
}

/**
 * Builds the scheduled playback layout for a progression in a key: piano
 * chords are held for the step or repeated on each quarter note. Bass plays
 * one root note per bar.
 */
export const buildPlaybackPlan = (
  progression: PlayableProgression,
  key: NoteName,
  pianoRhythm: PianoRhythm = "sustained"
): PlaybackPlan => {
  const chordEvents: ChordEvent[] = []
  const stabEvents: ChordEvent[] = []
  const bassEvents: BassEvent[] = []
  let beat = 0

  progression.steps.forEach((step, stepIndex) => {
    const spec = getChordToneSpec(step.toneId)
    if (!spec) throw new Error(`Unknown chord tone stack: ${step.toneId}`)

    const root = getStepRootNote(step, key)
    const chordRootMidi = pickRootMidi(root, CHORD_ROOT_LOW_MIDI)
    const bassMidi = pickRootMidi(root, BASS_ROOT_LOW_MIDI)
    const frequencies = spec.tones.map((tone) => {
      const midi = chordRootMidi + tone
      return 440 * Math.pow(2, (midi - 69) / 12)
    })
    const durationBeats = step.bars * 4

    if (pianoRhythm === "quarter_notes") {
      for (let quarter = 0; quarter < durationBeats; quarter += 1) {
        chordEvents.push({
          stepIndex,
          beat: beat + quarter,
          durationBeats: 1,
          frequencies,
        })
      }
    } else {
      chordEvents.push({
        stepIndex,
        beat,
        durationBeats,
        frequencies,
      })
    }

    if (progression.swing && pianoRhythm === "sustained") {
      const stab = shuffleStab({
        stepIndex,
        beat,
        durationBeats,
        frequencies,
      })
      if (stab) stabEvents.push(stab)
    }

    for (let bar = 0; bar < step.bars; bar += 1) {
      bassEvents.push({
        beat: beat + bar * 4,
        durationBeats: 4,
        frequency: 440 * Math.pow(2, (bassMidi - 69) / 12),
      })
    }

    beat += durationBeats
  })

  return {
    chordEvents,
    stabEvents,
    bassEvents,
    totalBeats: beat,
  }
}

export const getStepCount = (progression: PlayableProgression): number =>
  progression.steps.length
