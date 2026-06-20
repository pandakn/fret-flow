import { memo } from "react"
import type { ColorPreset } from "@/types/fretboard"

interface FretMarkersProps {
  fretCount: number
  colorPreset: ColorPreset
}

export const FretMarkers = memo<FretMarkersProps>(
  ({ fretCount, colorPreset }) => {
    const FRET_MARKERS = [3, 5, 7, 9, 12]
    const DOUBLE_MARKER_FRETS = [12]

    const markerColor = `var(--fretboard-${colorPreset}-marker)`

    return (
      <div
        className="pointer-events-none absolute inset-0 flex"
        style={{ left: "42px" }}
      >
        {Array.from({ length: fretCount }, (_, i) => {
          const fretNum = i + 1
          if (!FRET_MARKERS.includes(fretNum))
            return <div key={fretNum} className="flex-1" />
          return (
            <div key={fretNum} className="relative flex-1">
              <div className="absolute inset-0 flex items-end justify-center pb-1">
                {DOUBLE_MARKER_FRETS.includes(fretNum) ? (
                  <div
                    className="flex"
                    style={{
                      gap: "4px",
                      transform: "translateY(-6px)",
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: "5px",
                        height: "5px",
                        backgroundColor: markerColor,
                      }}
                    />
                    <div
                      className="rounded-full"
                      style={{
                        width: "5px",
                        height: "5px",
                        backgroundColor: markerColor,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-full"
                    style={{
                      width: "5px",
                      height: "5px",
                      backgroundColor: markerColor,
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)

FretMarkers.displayName = "FretMarkers"
