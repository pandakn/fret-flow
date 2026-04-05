import { useState } from "react";
import type { NoteName } from "@/types/music";
import { SCALES } from "@/lib/scales";
import { TUNINGS } from "@/lib/tunings";
import { CHROMATIC } from "@/lib/notes";

export function useControls() {
  const [root, setRoot] = useState<NoteName>("C");
  const [scaleId, setScaleId] = useState("major");
  const [tuningId, setTuningId] = useState("standard");
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [showIntervals, setShowIntervals] = useState(false);

  return {
    root,
    scaleId,
    tuningId,
    showNoteNames,
    showIntervals,
    setRoot,
    setScaleId,
    setTuningId,
    setShowNoteNames,
    setShowIntervals,
  };
}

export const KEYS = CHROMATIC;
export const AVAILABLE_SCALES = SCALES;
export const AVAILABLE_TUNINGS = TUNINGS;
