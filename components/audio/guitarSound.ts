import type { Sampler } from "tone"
import {
  createEmilyGuitarSampleMap,
  DEFAULT_GUITAR_VELOCITY,
  EMILY_GUITAR_ROUND_ROBIN_COUNT,
  EMILY_GUITAR_SAMPLE_BASE_URL,
  EMILY_GUITAR_VELOCITY_LAYERS,
  getEmilyGuitarVelocityLayer,
  type EmilyGuitarVelocityLayer,
} from "./emilyGuitar"

type ToneModule = typeof import("tone")

let toneModulePromise: Promise<ToneModule> | null = null
let guitarSamplerPromise: Promise<GuitarSampler> | null = null

type GuitarVoice = {
  layer: EmilyGuitarVelocityLayer
  roundRobin: number
  sampler: Sampler
}

export type GuitarSampler = {
  triggerAttackRelease: (
    frequency: number,
    duration: number,
    time?: number,
    velocity?: number
  ) => void
  releaseAll: (time?: number) => void
  dispose: () => void
}

/**
 * Keeps the existing sampler-facing API while selecting Emilyguitar's
 * velocity layer and round-robin recording for each note.
 */
class EmilyGuitarSampler implements GuitarSampler {
  private nextRoundRobin = 0

  constructor(private readonly voices: readonly GuitarVoice[]) {}

  triggerAttackRelease(
    frequency: number,
    duration: number,
    time?: number,
    velocity = DEFAULT_GUITAR_VELOCITY
  ): void {
    const layer = getEmilyGuitarVelocityLayer(velocity)
    const roundRobin =
      (this.nextRoundRobin++ % EMILY_GUITAR_ROUND_ROBIN_COUNT) + 1
    const voice = this.voices.find(
      (candidate) =>
        candidate.layer === layer && candidate.roundRobin === roundRobin
    )

    voice?.sampler.triggerAttackRelease(
      frequency,
      duration,
      time,
      Math.max(0, Math.min(1, velocity))
    )
  }

  releaseAll(time?: number): void {
    this.voices.forEach(({ sampler }) => sampler.releaseAll(time))
  }

  dispose(): void {
    this.voices.forEach(({ sampler }) => sampler.dispose())
  }
}

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

/** Loads the shared Emilyguitar instrument on first use. */
export const getGuitarSampler = async (
  tone: ToneModule
): Promise<GuitarSampler> => {
  if (!guitarSamplerPromise) {
    const voices: GuitarVoice[] = []

    try {
      EMILY_GUITAR_VELOCITY_LAYERS.forEach(({ id: layer }) => {
        for (
          let roundRobin = 1;
          roundRobin <= EMILY_GUITAR_ROUND_ROBIN_COUNT;
          roundRobin += 1
        ) {
          const sampler = new tone.Sampler({
            urls: createEmilyGuitarSampleMap(layer, roundRobin),
            baseUrl: EMILY_GUITAR_SAMPLE_BASE_URL,
            release: 0.25,
            volume: -9,
          }).toDestination()

          voices.push({ layer, roundRobin, sampler })
        }
      })
    } catch (error) {
      voices.forEach(({ sampler }) => sampler.dispose())
      throw error
    }

    const sampler = new EmilyGuitarSampler(voices)
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
