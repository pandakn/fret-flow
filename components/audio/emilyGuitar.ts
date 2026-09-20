export const EMILY_GUITAR_SAMPLE_BASE_URL =
  "https://raw.githubusercontent.com/sfzinstruments/karoryfer.emilyguitar/master/notes/"

/** Sample centers and zones from emily_clean.sfz. */
export const EMILY_GUITAR_NOTE_ANCHORS = [
  { midi: 37, fileName: "db2" },
  { midi: 40, fileName: "e2" },
  { midi: 42, fileName: "gb2" },
  { midi: 45, fileName: "a2" },
  { midi: 48, fileName: "c3" },
  { midi: 51, fileName: "eb3" },
  { midi: 54, fileName: "gb3" },
  { midi: 57, fileName: "a3" },
  { midi: 60, fileName: "c4" },
  { midi: 63, fileName: "eb4" },
  { midi: 66, fileName: "gb4" },
  { midi: 69, fileName: "a4" },
  { midi: 72, fileName: "c5" },
  { midi: 75, fileName: "eb5" },
  { midi: 78, fileName: "gb5" },
  { midi: 81, fileName: "a5" },
  { midi: 84, fileName: "c6" },
  { midi: 86, fileName: "d6" },
] as const

/** Four velocity ranges from the SFZ note regions (1–127). */
export const EMILY_GUITAR_VELOCITY_LAYERS = [
  { id: "p", min: 1, max: 40 },
  { id: "mp", min: 41, max: 80 },
  { id: "mf", min: 81, max: 120 },
  { id: "f", min: 121, max: 127 },
] as const

export type EmilyGuitarVelocityLayer =
  (typeof EMILY_GUITAR_VELOCITY_LAYERS)[number]["id"]

export const EMILY_GUITAR_ROUND_ROBIN_COUNT = 3
export const DEFAULT_GUITAR_VELOCITY = 0.76

/** Converts a normalized Tone velocity into the matching SFZ velocity layer. */
export const getEmilyGuitarVelocityLayer = (
  velocity: number
): EmilyGuitarVelocityLayer => {
  const midiVelocity = Math.max(1, Math.min(127, Math.round(velocity * 127)))

  return (
    EMILY_GUITAR_VELOCITY_LAYERS.find(
      (layer) => midiVelocity <= layer.max
    )?.id ?? "f"
  )
}

/** Builds one Tone.Sampler URL map for a velocity layer and round robin pass. */
export const createEmilyGuitarSampleMap = (
  layer: EmilyGuitarVelocityLayer,
  roundRobin: number
): Record<number, string> =>
  Object.fromEntries(
    EMILY_GUITAR_NOTE_ANCHORS.map(({ midi, fileName }) => [
      midi,
      `${fileName}_${layer}_rr${roundRobin}.wav`,
    ])
  )
