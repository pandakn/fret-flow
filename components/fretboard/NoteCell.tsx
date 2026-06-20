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

    const rootNoteColor = "var(--color-deg1)"
    const intervalColor = interval
      ? INTERVAL_COLORS[interval]
      : "var(--color-deg2)"
    const boardBg = `var(--fretboard-${colorPreset}-bg)`

    const size = isRoot ? 14 : 11
    const textFs = isRoot ? 7 : 6

    return (
      <Button
        variant="ghost"
        className={cn(
          "z-20 flex items-center justify-center rounded-full p-0 font-bold transition-all duration-150",
          isRoot ? "ring-2 ring-offset-1" : "border",
          isHovered && "scale-110"
        )}
        style={{
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          backgroundColor: isRoot ? rootNoteColor : `${intervalColor}26`,
          color: isRoot ? "#faf9f7" : intervalColor,
          borderColor: isRoot ? undefined : intervalColor,
          fontSize: `${textFs}px`,
          fontFamily: "var(--font-mono)",
          ["--tw-ring-color" as string]: "var(--color-deg1)",
          ["--tw-ring-offset-color" as string]: boardBg,
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
