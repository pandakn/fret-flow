"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { useFretboard } from "@/components/fretboard/hooks/useFretboard";
import type { NoteName } from "@/types/music";

interface FretboardPanelProps {
  root: NoteName;
  scaleId: string;
  tuningId: string;
  showNoteNames: boolean;
  showIntervals: boolean;
}

export function FretboardPanel({
  root,
  scaleId,
  tuningId,
  showNoteNames,
  showIntervals,
}: FretboardPanelProps) {
  const { fretNotesByString, fretCount, scale } = useFretboard({
    root,
    scaleId,
    tuningId,
  });

  if (!scale) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {root} {scale.name} Scale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Fretboard
          fretNotes={fretNotesByString}
          fretCount={fretCount}
          showNoteNames={showNoteNames}
          showIntervals={showIntervals}
        />
      </CardContent>
    </Card>
  );
}
