"use client";

import { useState } from "react";
import { StringRow } from "./StringRow";
import { FretMarkers } from "./FretMarkers";
import { cn } from "@/lib/utils";
import type { FretNote } from "@/types/music";

interface FretboardProps {
  fretNotes: FretNote[][];
  fretCount: number;
  showNoteNames?: boolean;
  showIntervals?: boolean;
  onNoteClick?: (note: FretNote) => void;
  className?: string;
}

export function Fretboard({
  fretNotes,
  fretCount,
  showNoteNames = true,
  showIntervals = false,
  onNoteClick,
  className,
}: FretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  const getNoteKey = (stringIdx: number, fret: number) => `${stringIdx}-${fret}`;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[1200px] p-6">
        {/* Fret Numbers */}
        <div className="flex mb-3">
          <div className="w-16 shrink-0" />
          {Array.from({ length: fretCount }, (_, i) => (
            <div key={i + 1} className="flex-1 text-center text-sm font-semibold text-muted-foreground">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Fretboard */}
        <div className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg overflow-hidden shadow-lg">
          {/* Nut */}
          <div className="absolute left-16 top-0 bottom-0 w-2 bg-gray-100 shadow-md z-10" />

          {/* Fret Markers */}
          <FretMarkers fretCount={fretCount} />

          {/* Strings */}
          {fretNotes.map((notes, stringIndex) => (
            <StringRow
              key={stringIndex}
              stringIndex={stringIndex}
              fretNotes={notes}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              hoveredNote={hoveredNote}
              onNoteHover={setHoveredNote}
              onNoteClick={onNoteClick || (() => {})}
              getNoteKey={getNoteKey}
            />
          ))}
        </div>

        {/* String Labels */}
        <div className="flex mt-3">
          <div className="w-16 shrink-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">Open</span>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
