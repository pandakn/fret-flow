import type { ChordVoicing, ChordVoicingPosition } from "@/lib/chord-voicings"
import type { IntervalName } from "@/types/music"
import type { Locale } from "./locales"

const scales: Record<string, string> = {
  major: "Major",
  natural_minor: "Natural Minor",
  pentatonic_major: "Major Pentatonic",
  pentatonic_minor: "Minor Pentatonic",
  blues: "Blues",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  harmonic_minor: "Harmonic Minor",
}

const chords: Record<string, string> = {
  major: "Major",
  minor: "Minor",
  dominant_7: "Dominant 7",
  minor_7: "Minor 7",
  major_7: "Major 7",
  half_diminished_7: "Half-diminished 7",
  diminished: "Diminished",
  augmented: "Augmented",
  sus2: "Sus2",
  sus4: "Sus4",
}

const intervalNames: Record<IntervalName, string> = {
  R: "Root",
  b2: "Minor 2nd",
  "2": "Major 2nd",
  b3: "Minor 3rd",
  "3": "Major 3rd",
  "4": "Perfect 4th",
  b5: "Diminished 5th",
  "#4": "Augmented 4th",
  "5": "Perfect 5th",
  b6: "Minor 6th",
  "#5": "Augmented 5th",
  "6": "Major 6th",
  b7: "Minor 7th",
  "7": "Major 7th",
}

export const scaleLabel = (
  locale: Locale,
  id: string,
  fallback = id
): string => (locale === "th" ? (scales[id] ?? fallback) : fallback)

export const chordLabel = (
  locale: Locale,
  id: string,
  fallback = id
): string => (locale === "th" ? (chords[id] ?? fallback) : fallback)

export const intervalLabel = (locale: Locale, interval: IntervalName): string =>
  intervalNames[interval][locale === "th" ? 1 : 0]

export const tuningLabel = (
  locale: Locale,
  id: string,
  fallback = id
): string => (locale === "th" && id === "standard" ? "มาตรฐาน" : fallback)

export const voicingPositionLabel = (
  locale: Locale,
  position: ChordVoicingPosition
): string => {
  if (locale === "en")
    return { open: "Open", barre: "Barre", "up-neck": "Up-neck" }[position]
  return { open: "ตำแหน่งเปิด", barre: "บาร์คอร์ด", "up-neck": "บนคอ" }[
    position
  ]
}

export const voicingLabel = (locale: Locale, voicing: ChordVoicing): string => {
  if (locale === "en") return voicing.label
  const shape = voicing.cagedShape ?? voicing.label.match(/[CAGED]/)?.[0]
  return shape
    ? `รูป ${shape} · ${voicingPositionLabel(locale, voicing.position)}`
    : voicingPositionLabel(locale, voicing.position)
}
