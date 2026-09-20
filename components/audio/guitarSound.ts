import type { Sampler } from "tone"

type ToneModule = typeof import("tone")

let toneModulePromise: Promise<ToneModule> | null = null
let guitarSamplerPromise: Promise<Sampler> | null = null

const ELECTRIC_GUITAR_SAMPLE_BASE_URL =
  "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-electric/"

// Tone.Sampler repitches between these recorded notes, keeping the first
// interaction lighter than loading the complete source kit.
const ELECTRIC_GUITAR_SAMPLES = {
  E2: "E2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  "C#2": "Cs2.mp3",
  C3: "C3.mp3",
  "C#3": "Cs3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
} as const

const loadTone = (): Promise<ToneModule> => {
  if (!toneModulePromise) {
    toneModulePromise = import("tone").catch((error) => {
      toneModulePromise = null
      throw error
    })
  }

  return toneModulePromise
}

/** Starts Tone's audio context from a user-triggered interaction. */
export const startGuitarAudio = async (): Promise<ToneModule> => {
  const tone = await loadTone()
  await tone.start()
  return tone
}

/** Loads the shared recorded electric-guitar instrument on first use. */
export const getGuitarSampler = async (tone: ToneModule): Promise<Sampler> => {
  if (!guitarSamplerPromise) {
    const sampler = new tone.Sampler({
      urls: ELECTRIC_GUITAR_SAMPLES,
      baseUrl: ELECTRIC_GUITAR_SAMPLE_BASE_URL,
      release: 1.2,
      volume: -9,
    }).toDestination()

    guitarSamplerPromise = tone
      .loaded()
      .then(() => sampler)
      .catch((error) => {
        guitarSamplerPromise = null
        sampler.dispose()
        throw error
      })
  }

  return guitarSamplerPromise
}
