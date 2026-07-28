"use client"

import type { ResolvedArpeggio } from "@/lib/arpeggios"
import type { NoteName } from "@/types/music"
import { PlaybackControls } from "./PlaybackControls"

interface ArpeggioPlaybackProps {
  root: NoteName
  arpeggio?: ResolvedArpeggio
}

const EMPTY_SEQUENCE = [] as const

export function ArpeggioPlayback({ root, arpeggio }: ArpeggioPlaybackProps) {
  return (
    <PlaybackControls
      root={root}
      sequence={arpeggio?.steps ?? EMPTY_SEQUENCE}
      playLabel="Play arpeggio"
      unavailableLabel="Arpeggio unavailable"
    />
  )
}
