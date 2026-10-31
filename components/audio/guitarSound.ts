import { STEEL_GUITAR_BASE_URL, STEEL_GUITAR_SAMPLES } from "./steelGuitar"

type ToneModule = typeof import("tone")

let toneModulePromise: Promise<ToneModule> | null = null
let guitarSamplerPromise: Promise<GuitarSampler> | null = null
let rawGuitarSampler: GuitarSampler | null = null
let routeOwner: symbol | null = null
let previewGeneration = 0

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
  loadedToneForClick = tone
  return tone
}

/** Loads the shared steel-string instrument on first use. */
const loadGuitarSampler = async (tone: ToneModule): Promise<GuitarSampler> => {
  if (!guitarSamplerPromise) {
    const sampler = new tone.Sampler({
      urls: STEEL_GUITAR_SAMPLES,
      baseUrl: STEEL_GUITAR_BASE_URL,
      release: 0.25,
      volume: -9,
    }).toDestination()
    guitarSamplerPromise = tone
      .loaded()
      .then(() => {
        rawGuitarSampler = sampler
        return sampler
      })
      .catch((error) => {
        guitarSamplerPromise = null
        sampler.dispose()
        throw error
      })
  }
  return guitarSamplerPromise
}

export const getGuitarSampler = async (
  tone: ToneModule
): Promise<GuitarSampler> => {
  const sampler = await loadGuitarSampler(tone)
  const generation = previewGeneration
  const available = () =>
    generation === previewGeneration && routeOwner === null
  return {
    triggerAttackRelease: (...args) => {
      if (available()) sampler.triggerAttackRelease(...args)
    },
    releaseAll: (...args) => {
      if (available()) sampler.releaseAll(...args)
    },
    dispose: () => {},
  }
}

export const acquireScaleRouteAudio = () => ({
  acquire: () => {
    const owner = Symbol("guided-route-playback")
    routeOwner = owner
    previewGeneration += 1
    rawGuitarSampler?.releaseAll()
    let ownedSampler: GuitarSampler | null = null
    return {
      start: async () => {
        const tone = await startGuitarAudio()
        const context = tone.getContext()
        return {
          now: () => context.now(),
          setTimeout: (callback: () => void, seconds: number) =>
            context.setTimeout(callback, seconds),
          clearTimeout: (id: number) => {
            context.clearTimeout(id)
          },
        }
      },
      getSampler: async () => {
        const tone = await loadTone()
        const sampler = await loadGuitarSampler(tone)
        if (routeOwner !== owner) throw new Error("Route playback was stopped.")
        ownedSampler = sampler
        return {
          triggerAttackRelease: (
            ...args: Parameters<GuitarSampler["triggerAttackRelease"]>
          ) => {
            if (routeOwner === owner) sampler.triggerAttackRelease(...args)
          },
        }
      },
      createClick: () => {
        const tone = requireToneForClick()
        const synth = new tone.Synth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.002, decay: 0.04, sustain: 0, release: 0.02 },
        }).toDestination()
        return {
          trigger: (time: number, beat: number) =>
            synth.triggerAttackRelease(
              beat === 1 ? "A5" : "E5",
              0.06,
              time,
              0.18
            ),
          dispose: () => synth.dispose(),
        }
      },
      release: () => {
        if (routeOwner !== owner) return
        ownedSampler?.releaseAll()
        routeOwner = null
        previewGeneration += 1
      },
    }
  },
})

let loadedToneForClick: ToneModule | null = null
const requireToneForClick = (): ToneModule => {
  if (!loadedToneForClick) throw new Error("Audio is not ready.")
  return loadedToneForClick
}
