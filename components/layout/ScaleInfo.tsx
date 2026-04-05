"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NoteName } from "@/types/music";
import { CHROMATIC } from "@/lib/notes";
import { SCALES } from "@/lib/scales";

interface ScaleInfoProps {
  root: NoteName;
  scaleId: string;
}

export function ScaleInfo({ root, scaleId }: ScaleInfoProps) {
  const scale = SCALES.find((s) => s.id === scaleId);
  if (!scale) return null;

  const rootIndex = CHROMATIC.indexOf(root);
  const displayScaleNotes = scale.intervals.map(
    (interval, index) => CHROMATIC[(rootIndex + getIntervalSemitone(interval, index)) % 12]
  );

  const getRelativeKey = () => {
    if (scaleId === "major") {
      const relativeMinorIndex = (rootIndex + 9) % 12;
      return CHROMATIC[relativeMinorIndex] + " Minor";
    }
    if (scaleId === "natural_minor") {
      const relativeMajorIndex = (rootIndex + 3) % 12;
      return CHROMATIC[relativeMajorIndex] + " Major";
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Scale Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Scale Name</p>
          <p className="font-semibold text-gray-900">
            {root} {scale.name}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Notes</p>
          <div className="flex flex-wrap gap-1">
            {displayScaleNotes.map((note, i) => (
              <span
                key={i}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  i === 0
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                {note}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Formula</p>
          <p className="font-mono text-sm text-gray-700">
            {scale.intervals.join(" - ")}
          </p>
        </div>
        {getRelativeKey() && (
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {scaleId === "major" ? "Relative Minor" : "Relative Major"}
            </p>
            <p className="font-semibold text-gray-900">{getRelativeKey()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getIntervalSemitone(interval: string, index: number): number {
  const semitoneMap: Record<string, number> = {
    R: 0,
    b2: 1, 2: 2,
    b3: 3, 3: 4,
    4: 5,
    b5: 6, "#4": 6,
    5: 7,
    b6: 8, "#5": 8,
    6: 9,
    b7: 10, 7: 11,
  };
  return semitoneMap[interval] ?? index;
}
