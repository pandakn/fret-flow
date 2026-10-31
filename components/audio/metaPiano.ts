import type { Sampler } from "tone"

const BASE_URL =
  "https://raw.githubusercontent.com/facebookincubator/Meta-open-sound/main/systems/instruments/meta-piano/ogg/"

// One recorded note every three semitones in the progression chord range.
export const META_PIANO_SAMPLES: Record<string, string> = {
  C3: "INSPiano_Vel03_C3_01.ogg",
  "D#3": "INSPiano_Vel03_Ds3_01.ogg",
  "F#3": "INSPiano_Vel03_Fs3_01.ogg",
  A3: "INSPiano_Vel03_A3_01.ogg",
  C4: "INSPiano_Vel03_C4_01.ogg",
  "D#4": "INSPiano_Vel03_Ds4_01.ogg",
  "F#4": "INSPiano_Vel03_Fs4_01.ogg",
  A4: "INSPiano_Vel03_A4_01.ogg",
  C5: "INSPiano_Vel03_C5_01.ogg",
  "D#5": "INSPiano_Vel03_Ds5_01.ogg",
  "F#5": "INSPiano_Vel03_Fs5_01.ogg",
}

let samplerPromise: Promise<Sampler> | null = null

export function getMetaPiano(tone: typeof import("tone")): Promise<Sampler> {
  if (!samplerPromise) {
    samplerPromise = new Promise<Sampler>((resolve, reject) => {
      const sampler = new tone.Sampler({
        urls: META_PIANO_SAMPLES,
        baseUrl: BASE_URL,
        release: 1,
        volume: -9,
        onload: () => resolve(sampler),
        onerror: (error) => {
          sampler.dispose()
          reject(error)
        },
      }).toDestination()
    }).catch((error: unknown) => {
      samplerPromise = null
      throw error
    })
  }
  return samplerPromise
}
