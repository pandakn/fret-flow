import { memo } from "react";

interface FretMarkersProps {
  fretCount: number;
}

export const FretMarkers = memo<FretMarkersProps>(({ fretCount }) => {
  const FRET_MARKERS = [3, 5, 7, 9, 12];
  const DOUBLE_MARKER_FRETS = [12];

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
                    <div className="w-3 h-3 rounded-full bg-gray-300/40" />
                    <div className="w-3 h-3 rounded-full bg-gray-300/40" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-300/40" />
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
