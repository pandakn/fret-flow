import { memo } from "react"
import { Button } from "@/components/ui/button"
import { INTERVAL_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"
import type { ColorPreset } from "@/types/fretboard"

interface NoteCellProps {
  note: string
  interval: string | null
  isRoot: boolean
  isActive: boolean
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
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
    colorPreset,
    isHovered,
    onHover,
    onClick,
    "aria-label": ariaLabel,
  }) => {
    if (!isActive) return null
    if (rootOnly && !isRoot) return null

    const isMinimal = colorPreset === "minimal"
    const rootNoteColor = "var(--color-deg1)"
    const intervalColor = interval
      ? INTERVAL_COLORS[interval]
      : "var(--color-deg2)"

    const size = isMinimal ? (isRoot ? 22 : 18) : isRoot ? 12 : 10
    const textFs = isMinimal ? (isRoot ? 8 : 7) : isRoot ? 9 : 8

    return (
      <Button
        variant="ghost"
        className={cn(
          "z-20 flex items-center justify-center rounded-full p-0 font-bold transition-all duration-150",
          isMinimal
            ? isRoot
              ? "ring-2 ring-offset-1"
              : "border"
            : isRoot
              ? "ring-2 ring-gray-500/50"
              : "ring-1 ring-black/20",
          isHovered && "scale-110"
        )}
        style={{
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          backgroundColor: isRoot
            ? rootNoteColor
            : isMinimal
              ? `${intervalColor}26`
              : intervalColor,
          color: isRoot || !isMinimal ? "#faf9f7" : intervalColor,
          borderColor: isMinimal && !isRoot ? intervalColor : undefined,
          fontSize: `${textFs}px`,
          fontFamily: "var(--font-mono)",
          ["--tw-ring-color" as string]: isMinimal
            ? "var(--color-deg1)"
            : undefined,
          ["--tw-ring-offset-color" as string]: isMinimal
            ? "var(--fretboard-minimal-bg)"
            : undefined,
        }}
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
