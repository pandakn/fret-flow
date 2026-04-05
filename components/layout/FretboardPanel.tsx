"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { useFretboard } from "@/components/fretboard/hooks/useFretboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NoteName } from "@/types/music";
import type { ColorPreset } from "@/types/fretboard";
import { SCALES } from "@/lib/scales";

interface FretboardPanelProps {
  root: NoteName;
  scaleId: string;
  tuningId: string;
  fretCount: number;
  colorPreset: ColorPreset;
  showNoteNames: boolean;
  showIntervals: boolean;
  onRootChange: (root: NoteName) => void;
  onScaleChange: (scaleId: string) => void;
}

export function FretboardPanel({
  root,
  scaleId,
  tuningId,
  fretCount,
  colorPreset,
  showNoteNames,
  showIntervals,
  onRootChange,
  onScaleChange,
}: FretboardPanelProps) {
  const { fretNotesByString, scale } = useFretboard({
    root,
    scaleId,
    tuningId,
    fretRange: { min: 0, max: fretCount },
  });

  const KEYS: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  if (!scale) return null;

  return (
    <Card className="shadow-sm">
      <div className="border-b bg-gray-50 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {root} {scale.name} Scale
          </h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={root} onValueChange={onRootChange}>
              <SelectTrigger className="flex-1 sm:flex-none">
                <SelectValue placeholder="Select key" />
              </SelectTrigger>
              <SelectContent>
                {KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scaleId} onValueChange={onScaleChange}>
              <SelectTrigger className="flex-1 sm:flex-none">
                <SelectValue placeholder="Select scale" />
              </SelectTrigger>
              <SelectContent>
                {SCALES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <CardContent>
        <Fretboard
          fretNotes={fretNotesByString}
          fretCount={fretCount}
          colorPreset={colorPreset}
          showNoteNames={showNoteNames}
          showIntervals={showIntervals}
        />
      </CardContent>
    </Card>
  );
}
