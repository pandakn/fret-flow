import { memo } from "react";
import type { ColorPreset } from "@/types/fretboard";

interface FretMarkersProps {
  fretCount: number;
  colorPreset: ColorPreset;
}

export const FretMarkers = memo<FretMarkersProps>(({ fretCount, colorPreset }) => {
  const FRET_MARKERS = [3, 5, 7, 9, 12];
  const DOUBLE_MARKER_FRETS = [12];

  const getMarkerColor = (preset: ColorPreset): string => {
    const colors: Record<ColorPreset, string> = {
      natural: "bg-gray-300/40",
      light: "bg-gray-600/30",
      dark: "bg-gray-300/40",
      blue: "bg-blue-300/30",
      purple: "bg-purple-300/30",
      green: "bg-green-300/30",
      red: "bg-red-300/30",
    };
    return colors[preset];
  };

  const markerColor = getMarkerColor(colorPreset);

  return (
    <div className="absolute inset-0 flex" style={{ left: "48px" }}>
      {Array.from({ length: fretCount }, (_, i) => {
        const fretNum = i + 1;
        return (
          <div key={fretNum} className="flex-1 relative">
            {FRET_MARKERS.includes(fretNum) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {DOUBLE_MARKER_FRETS.includes(fretNum) ? (
                  <div className="flex flex-col gap-8">
                    <div className={`w-3 h-3 rounded-full ${markerColor}`} />
                    <div className={`w-3 h-3 rounded-full ${markerColor}`} />
                  </div>
                ) : (
                  <div className={`w-3 h-3 rounded-full ${markerColor}`} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

FretMarkers.displayName = "FretMarkers";
