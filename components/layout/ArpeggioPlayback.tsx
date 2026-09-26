"use client"

import type { ResolvedArpeggio } from "@/lib/arpeggios"
import type { NoteName } from "@/types/music"
import { PlaybackControls } from "./PlaybackControls"
import { useI18n } from "@/components/i18n/LocaleProvider"

interface ArpeggioPlaybackProps {
  root: NoteName
  arpeggio?: ResolvedArpeggio
}

const EMPTY_SEQUENCE = [] as const

export function ArpeggioPlayback({ root, arpeggio }: ArpeggioPlaybackProps) {
  const { t } = useI18n()
  return (
    <PlaybackControls
      root={root}
      sequence={arpeggio?.steps ?? EMPTY_SEQUENCE}
      playLabel={t("playArpeggio")}
      unavailableLabel={t("arpeggioUnavailable")}
    />
  )
}
