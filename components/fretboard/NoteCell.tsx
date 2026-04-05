import { memo } from "react";
import { Button } from "@/components/ui/button";
import { INTERVAL_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { ColorPreset } from "@/types/fretboard";

interface NoteCellProps {
  note: string;
  interval: string | null;
  isRoot: boolean;
  isActive: boolean;
  showNoteNames: boolean;
  showIntervals: boolean;
  colorPreset: ColorPreset;
  isHovered: boolean;
  onHover: (hovering: boolean) => void;
  onClick: () => void;
  "aria-label": string;
}

export const NoteCell = memo<NoteCellProps>(
  ({
    note,
    interval,
    isRoot,
    isActive,
    showNoteNames,
    showIntervals,
    colorPreset,
    isHovered,
    onHover,
    onClick,
    "aria-label": ariaLabel,
  }) => {
    if (!isActive) return null;

    const isLightPreset = colorPreset === "light";
    const rootNoteColor = "var(--color-root)";
    const intervalColor = interval ? INTERVAL_COLORS[interval] : "var(--color-2)";

    const getPresetTextColor = (preset: ColorPreset): string => {
      const colors: Record<ColorPreset, string> = {
        natural: "var(--fretboard-natural-text)",
        light: "var(--fretboard-light-text)",
        dark: "var(--fretboard-dark-text)",
        blue: "var(--fretboard-blue-text)",
        purple: "var(--fretboard-purple-text)",
        green: "var(--fretboard-green-text)",
        red: "var(--fretboard-red-text)",
      };
      return colors[preset];
    };

    const textColor = getPresetTextColor(colorPreset);
    const ringColor = isLightPreset ? "ring-gray-500/40" : "ring-white/20";
    const hoverRingColor = isLightPreset ? "ring-gray-600" : "ring-orange-400";

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150 z-20 p-0",
          isRoot
            ? "w-12 h-12 ring-2 ring-gray-500/50"
            : `ring-1 ${ringColor}`,
          isHovered && `scale-110 ring-2 ${hoverRingColor}`
        )}
        style={{
          backgroundColor: isRoot ? rootNoteColor : intervalColor,
          color: textColor,
          boxShadow: isRoot ? "0 0 12px rgba(212, 149, 42, 0.6)" : isLightPreset ? "0 0 6px rgba(0, 0, 0, 0.15)" : "0 0 8px rgba(0, 0, 0, 0.3)",
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {showIntervals && interval ? interval : showNoteNames ? note : ""}
      </Button>
    );
  }
);

NoteCell.displayName = "NoteCell";
