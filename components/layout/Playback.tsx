"use client"

import { useMemo } from "react"
import { getScaleById } from "@/lib/scales"
import type { NoteName } from "@/types/music"
import { PlaybackControls } from "./PlaybackControls"

interface PlaybackProps {
  root: NoteName
  scaleId: string
}

export function Playback({ root, scaleId }: PlaybackProps) {
  const sequence = useMemo(
    () =>
      (getScaleById(scaleId)?.intervals ?? []).map((interval) => ({
        interval,
      })),
    [scaleId]
  )

  return (
    <PlaybackControls
      root={root}
      sequence={sequence}
      playLabel="Play scale"
      unavailableLabel="Scale unavailable"
    />
  )
}
