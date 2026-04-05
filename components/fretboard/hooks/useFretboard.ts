import type { NoteName, FretNote } from "@/types/music";
import { getFretNotes, DEFAULT_FRET_RANGE } from "@/lib/fretboard";
import { getScaleById } from "@/lib/scales";
import { getTuningById } from "@/lib/tunings";

interface UseFretboardProps {
  root?: NoteName;
  scaleId?: string;
  tuningId?: string;
  fretRange?: { min: number; max: number };
}

export function useFretboard({
  root = "C",
  scaleId = "major",
  tuningId = "standard",
  fretRange = DEFAULT_FRET_RANGE,
}: UseFretboardProps) {
  const scale = getScaleById(scaleId);
  const tuning = getTuningById(tuningId);

  const fretCount = fretRange.max - fretRange.min;

  const fretNotes = scale && tuning
    ? getFretNotes({
        root,
        formula: scale.formula,
        intervals: scale.intervals,
        tuning: tuning.strings,
        fretRange,
      })
    : [];

  // Group by string for efficient rendering
  const fretNotesByString: FretNote[][] = [];
  const stringCount = tuning?.strings.length || 6;

  for (let i = 0; i < stringCount; i++) {
    fretNotesByString.push(fretNotes.filter((n) => n.string === i));
  }

  return {
    selectedRoot: root,
    selectedScaleId: scaleId,
    selectedTuningId: tuningId,
    fretNotesByString,
    fretCount,
    scale,
    tuning,
  };
}
