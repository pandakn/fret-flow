"use client";

import { useState } from "react";
import { StringRow } from "./StringRow";
import { FretMarkers } from "./FretMarkers";
import { cn } from "@/lib/utils";
import type { FretNote } from "@/types/music";
import type { ColorPreset } from "@/types/fretboard";

interface FretboardProps {
  fretNotes: FretNote[][];
  fretCount: number;
  showNoteNames?: boolean;
  showIntervals?: boolean;
  colorPreset: ColorPreset;
  onNoteClick?: (note: FretNote) => void;
  className?: string;
}

export function Fretboard({
  fretNotes,
  fretCount,
  showNoteNames = true,
  showIntervals = false,
  colorPreset,
  onNoteClick,
  className,
}: FretboardProps) {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  const getPresetColors = (preset: ColorPreset) => {
    const presets: Record<ColorPreset, { isLight: boolean; start: string; end: string; nut: string; text: string; fretline: string; marker: string }> = {
      natural: {
        isLight: false,
        start: "var(--fretboard-natural-start)",
        end: "var(--fretboard-natural-end)",
        nut: "var(--fretboard-natural-nut)",
        text: "var(--fretboard-natural-text)",
        fretline: "var(--fretboard-natural-fretline)",
        marker: "bg-gray-300/40",
      },
      light: {
        isLight: true,
        start: "var(--fretboard-light-start)",
        end: "var(--fretboard-light-end)",
        nut: "var(--fretboard-light-nut)",
        text: "var(--fretboard-light-text)",
        fretline: "var(--fretboard-light-fretline)",
        marker: "bg-gray-500/30",
      },
      dark: {
        isLight: false,
        start: "var(--fretboard-dark-start)",
        end: "var(--fretboard-dark-end)",
        nut: "var(--fretboard-dark-nut)",
        text: "var(--fretboard-dark-text)",
        fretline: "var(--fretboard-dark-fretline)",
        marker: "bg-gray-300/40",
      },
      blue: {
        isLight: false,
        start: "var(--fretboard-blue-start)",
        end: "var(--fretboard-blue-end)",
        nut: "var(--fretboard-blue-nut)",
        text: "var(--fretboard-blue-text)",
        fretline: "var(--fretboard-blue-fretline)",
        marker: "bg-blue-300/30",
      },
      purple: {
        isLight: false,
        start: "var(--fretboard-purple-start)",
        end: "var(--fretboard-purple-end)",
        nut: "var(--fretboard-purple-nut)",
        text: "var(--fretboard-purple-text)",
        fretline: "var(--fretboard-purple-fretline)",
        marker: "bg-purple-300/30",
      },
      green: {
        isLight: false,
        start: "var(--fretboard-green-start)",
        end: "var(--fretboard-green-end)",
        nut: "var(--fretboard-green-nut)",
        text: "var(--fretboard-green-text)",
        fretline: "var(--fretboard-green-fretline)",
        marker: "bg-green-300/30",
      },
      red: {
        isLight: false,
        start: "var(--fretboard-red-start)",
        end: "var(--fretboard-red-end)",
        nut: "var(--fretboard-red-nut)",
        text: "var(--fretboard-red-text)",
        fretline: "var(--fretboard-red-fretline)",
        marker: "bg-red-300/30",
      },
    };
    return presets[preset];
  };

  const colors = getPresetColors(colorPreset);

  const getNoteKey = (stringIdx: number, fret: number) => `${stringIdx}-${fret}`;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="min-w-[1200px] p-6">
        {/* Fret Numbers */}
        <div className="flex mb-3">
          <div className="w-16 shrink-0" />
          {Array.from({ length: fretCount }, (_, i) => (
            <div
              key={i + 1}
              className="flex-1 text-center text-sm font-semibold"
              style={{
                color: colors.text,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Fretboard */}
        <div
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{
            background: `linear-gradient(to bottom, ${colors.start}, ${colors.end})`,
          }}
        >
          {/* Nut */}
          <div
            className="absolute left-16 top-0 bottom-0 w-2 shadow-md z-10"
            style={{
              backgroundColor: colors.nut,
            }}
          />

          {/* Fret Markers */}
          <FretMarkers fretCount={fretCount} colorPreset={colorPreset} />

          {/* Strings */}
          {fretNotes.map((notes, stringIndex) => (
            <StringRow
              key={stringIndex}
              stringIndex={stringIndex}
              fretNotes={notes}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              colorPreset={colorPreset}
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
            <span
              className="text-sm font-semibold"
              style={{
                color: colors.text,
              }}
            >
              Open
            </span>
          </div>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
