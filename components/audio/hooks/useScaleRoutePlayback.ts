"use client"

import { useCallback, useEffect, useState } from "react"
import type { ScaleRouteSnapshot } from "@/types/note-routes"
import { acquireScaleRouteAudio } from "@/components/audio/guitarSound"
import {
  createScaleRoutePlaybackController,
  type RoutePlaybackSnapshot,
} from "@/lib/note-routes/playback"

const STOPPED: RoutePlaybackSnapshot = {
  state: "stopped",
  currentOccurrenceId: null,
  countInBeat: null,
  error: null,
}

export function useScaleRoutePlayback({
  snapshot,
  bpm,
  loop,
}: {
  snapshot: ScaleRouteSnapshot
  bpm: number
  loop: boolean
}) {
  const [controller] = useState(() =>
    createScaleRoutePlaybackController(acquireScaleRouteAudio())
  )
  const [state, setState] = useState(STOPPED)
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState)
    return () => {
      unsubscribe()
    }
  }, [controller])
  useEffect(() => {
    controller.configure({ snapshot, bpm, loop })
  }, [bpm, controller, loop, snapshot])
  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.hidden) controller.stop()
    }
    document.addEventListener("visibilitychange", stopWhenHidden)
    return () =>
      document.removeEventListener("visibilitychange", stopWhenHidden)
  }, [controller])
  useEffect(() => () => controller.stop(), [controller])
  const start = useCallback(() => controller.start(), [controller])
  const stop = useCallback(() => controller.stop(), [controller])
  return { ...state, start, stop }
}
