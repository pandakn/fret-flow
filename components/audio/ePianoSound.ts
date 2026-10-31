import type { MonoSynth, PolySynth } from "tone"

type ToneModule = typeof import("tone")

let toneModulePromise: Promise<ToneModule> | null = null
let epInstrumentsPromise: Promise<EpInstruments> | null = null

export type EpInstruments = {
  /** Rhodes-style electric piano poly synth. */
  ep: PolySynth
  /** Root-supporting bass mono synth. */
  bass: MonoSynth
  releaseAll: () => void
  dispose: () => void
}

const bassEnvelope = {
  attack: 0.008,
  decay: 0.25,
  sustain: 0.6,
  release: 0.4,
}

/**
 * Electric-piano sound: two soft FM voices are chained so the attack carries a
 * bell-like "ting" before the tone settles — the Rhodes character this lab
 * leans on instead of the fretboard guitar sampler.
 */
const createEpInstruments = (tone: ToneModule): EpInstruments => {
  const ep = new tone.PolySynth(tone.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 12,
    oscillator: { type: "sine" },
    envelope: { attack: 0.004, decay: 1.6, sustain: 0.28, release: 1.4 },
    modulation: { type: "sine" },
    modulationEnvelope: { attack: 0.004, decay: 0.35, sustain: 0.1, release: 0.6 },
    volume: -8,
  })

  const bass = new tone.MonoSynth({
    oscillator: { type: "triangle" },
    filterEnvelope: {
      attack: 0.006,
      baseFrequency: 90,
      octaves: 2.4,
    },
    envelope: bassEnvelope,
    volume: -6,
  })

  ep.toDestination()
  bass.toDestination()
  return {
    ep,
    bass,
    releaseAll: () => {
      ep.releaseAll()
      bass.triggerRelease()
    },
    dispose: () => {
      ep.dispose()
      bass.dispose()
    },
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
export const startEpAudio = async (): Promise<ToneModule> => {
  const tone = await loadTone()
  await tone.start()
  return tone
}

/** Loads the shared EP + bass instruments on first use. */
export const getEpInstruments = async (
  tone: ToneModule
): Promise<EpInstruments> => {
  if (!epInstrumentsPromise) {
    epInstrumentsPromise = Promise.resolve()
      .then(() => createEpInstruments(tone))
      .then(async (instruments) => {
        await tone.loaded()
        return instruments
      })
      .catch((error) => {
        epInstrumentsPromise = null
        throw error
      })
  }

  return epInstrumentsPromise
}
