import { memo } from "react";
import { INTERVAL_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface NoteCellProps {
  note: string;
  interval: string | null;
  isRoot: boolean;
  isActive: boolean;
  showNoteNames: boolean;
  showIntervals: boolean;
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
    isHovered,
    onHover,
    onClick,
    "aria-label": ariaLabel,
  }) => {
    if (!isActive) return null;

    const rootNoteColor = "var(--color-root)";
    const intervalColor = interval ? INTERVAL_COLORS[interval] : "var(--color-2)";

    return (
      <button
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 z-20",
          isRoot
            ? "w-8 h-8 ring-2 ring-white/50"
            : "ring-1 ring-white/20",
          isHovered && "scale-110 ring-2 ring-orange-400"
        )}
        style={{
          backgroundColor: isRoot ? rootNoteColor : intervalColor,
          color: isRoot ? "#fff" : "#fff",
          boxShadow: isRoot ? "0 0 12px rgba(212, 149, 42, 0.6)" : "0 0 8px rgba(0, 0, 0, 0.3)",
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {showIntervals && interval ? interval : showNoteNames ? note : ""}
      </button>
    );
  }
);

NoteCell.displayName = "NoteCell";
