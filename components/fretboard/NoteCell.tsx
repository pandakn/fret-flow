import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ColorPreset } from "@/types/fretboard"
import { memo } from "react"

const INTERVAL_COLOR_CLASSES: Record<string, string> = {
  R: "bg-[var(--color-deg1)]/15 text-[var(--color-deg1)] border-[var(--color-deg1)]",
  b2: "bg-[var(--color-deg2)]/15 text-[var(--color-deg2)] border-[var(--color-deg2)]",
  "2": "bg-[var(--color-deg2)]/15 text-[var(--color-deg2)] border-[var(--color-deg2)]",
  b3: "bg-[var(--color-deg2)]/15 text-[var(--color-deg2)] border-[var(--color-deg2)]",
  "3": "bg-[var(--color-deg2)]/15 text-[var(--color-deg2)] border-[var(--color-deg2)]",
  "4": "bg-[var(--color-deg3)]/15 text-[var(--color-deg3)] border-[var(--color-deg3)]",
  b5: "bg-[var(--color-deg3)]/15 text-[var(--color-deg3)] border-[var(--color-deg3)]",
  "#4": "bg-[var(--color-deg3)]/15 text-[var(--color-deg3)] border-[var(--color-deg3)]",
  "5": "bg-[var(--color-deg3)]/15 text-[var(--color-deg3)] border-[var(--color-deg3)]",
  b6: "bg-[var(--color-deg3)]/15 text-[var(--color-deg3)] border-[var(--color-deg3)]",
  "#5": "bg-[var(--color-deg3)]/15 text-[var(--color-deg3)] border-[var(--color-deg3)]",
  "6": "bg-[var(--color-deg4)]/15 text-[var(--color-deg4)] border-[var(--color-deg4)]",
  b7: "bg-[var(--color-deg4)]/15 text-[var(--color-deg4)] border-[var(--color-deg4)]",
  "7": "bg-[var(--color-deg4)]/15 text-[var(--color-deg4)] border-[var(--color-deg4)]",
}

const RING_OFFSET_CLASSES: Record<ColorPreset, string> = {
  natural: "[--tw-ring-offset-color:var(--fretboard-natural-bg)]",
  light: "[--tw-ring-offset-color:var(--fretboard-light-bg)]",
  dark: "[--tw-ring-offset-color:var(--fretboard-dark-bg)]",
  blue: "[--tw-ring-offset-color:var(--fretboard-blue-bg)]",
  purple: "[--tw-ring-offset-color:var(--fretboard-purple-bg)]",
  green: "[--tw-ring-offset-color:var(--fretboard-green-bg)]",
  red: "[--tw-ring-offset-color:var(--fretboard-red-bg)]",
  minimal: "[--tw-ring-offset-color:var(--fretboard-minimal-bg)]",
}

interface NoteCellProps {
  note: string
  interval: string | null
  isRoot: boolean
  isActive: boolean
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
  isInFocus: boolean
  colorPreset: ColorPreset
  isHovered: boolean
  onHover: (hovering: boolean) => void
  onClick: () => void
  "aria-label": string
}

export const NoteCell = memo<NoteCellProps>(
  ({
    note,
    interval,
    isRoot,
    isActive,
    showNoteNames,
    showIntervals,
    rootOnly,
    isInFocus,
    colorPreset,
    isHovered,
    onHover,
    onClick,
    "aria-label": ariaLabel,
  }) => {
    if (!isActive) return null
    if (rootOnly && !isRoot) return null

    return (
      <Button
        variant="ghost"
        className={cn(
          "z-20 flex items-center justify-center rounded-full p-0 font-mono font-bold transition-[opacity,transform,box-shadow] duration-300 ease-out",
          isRoot
            ? "h-10 w-10 text-xl ring-2 ring-offset-1"
            : "h-9 w-9 border text-lg",
          isRoot
            ? "bg-(--color-deg1) text-[#faf9f7] ring-(--color-deg1)"
            : interval
              ? INTERVAL_COLOR_CLASSES[interval]
              : undefined,
          RING_OFFSET_CLASSES[colorPreset],
          isHovered && "scale-110",
          !isInFocus && "opacity-20"
        )}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {showIntervals && interval ? interval : showNoteNames ? note : ""}
      </Button>
    )
  }
)

NoteCell.displayName = "NoteCell"
