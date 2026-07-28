import type { NoteName } from "@/types/music"

export type Tuning = {
  id: string
  name: string
  strings: NoteName[]
}

export const TUNINGS: Tuning[] = [
  {
    id: "standard",
    name: "Standard",
    strings: ["E", "A", "D", "G", "B", "E"],
  },
]

export const getTuningById = (id: string): Tuning | undefined =>
  TUNINGS.find((t) => t.id === id)

/**
 * MIDI pitches for each open string, ordered low-to-high to match `Tuning`.
 *
 * A tuning's `strings` only contains pitch classes, which is enough to find a
 * note at a fret but not enough to play the correct register. Keep octave data
 * here with the supported tuning definitions instead of guessing it from a
 * note name at playback time.
 */
const OPEN_STRING_MIDI_BY_TUNING_ID: Record<string, readonly number[]> = {
  // E2, A2, D3, G3, B3, E4
  standard: [40, 45, 50, 55, 59, 64],
}

/** Returns the MIDI pitch at a fretted position for a supported tuning. */
export const getStringMidiAtFret = (
  tuning: Tuning,
  string: number,
  fret: number
): number | undefined => {
  const openStrings = OPEN_STRING_MIDI_BY_TUNING_ID[tuning.id]

  if (
    !openStrings ||
    openStrings.length !== tuning.strings.length ||
    !Number.isInteger(string) ||
    string < 0 ||
    string >= openStrings.length ||
    !Number.isInteger(fret) ||
    fret < 0
  ) {
    return undefined
  }

  return openStrings[string] + fret
}

/** Returns the equal-temperament frequency at a fretted position. */
export const getStringFrequencyAtFret = (
  tuning: Tuning,
  string: number,
  fret: number
): number | undefined => {
  const midi = getStringMidiAtFret(tuning, string, fret)
  return midi === undefined ? undefined : 440 * Math.pow(2, (midi - 69) / 12)
}
