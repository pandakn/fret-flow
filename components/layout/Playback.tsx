"use client"

import { useMemo } from "react"
import {
  EXPLORER_FRET_RANGE,
  getActiveFretNotesInPitchOrder,
} from "@/lib/fretboard"
import { getScaleById } from "@/lib/scales"
import { getStringFrequencyAtFret, getTuningById } from "@/lib/tunings"
import type { NoteName } from "@/types/music"
import { PlaybackControls } from "./PlaybackControls"

interface PlaybackProps {
  root: NoteName
  scaleId: string
  tuningId: string
}

export function Playback({ root, scaleId, tuningId }: PlaybackProps) {
  const sequence = useMemo(() => {
    const scale = getScaleById(scaleId)
    const tuning = getTuningById(tuningId)

    if (!scale || !tuning) return []

    return getActiveFretNotesInPitchOrder({
      root,
      pattern: scale,
      tuning,
      fretRange: EXPLORER_FRET_RANGE,
    }).flatMap((note) => {
      if (!note.interval) return []

      const frequency = getStringFrequencyAtFret(tuning, note.string, note.fret)

      return frequency === undefined
        ? []
        : [{ interval: note.interval, frequency }]
    })
  }, [root, scaleId, tuningId])

  return (
    <PlaybackControls
      root={root}
      sequence={sequence}
      playLabel="Play scale"
      unavailableLabel="Scale unavailable"
    />
  )
}
