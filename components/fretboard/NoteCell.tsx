import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FretNote, IntervalName, NoteName } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"
import { memo, useCallback } from "react"

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
  note: NoteName
  displayNote?: string
  interval: IntervalName | null
  stringIndex: number
  fret: number
  noteKey: string
  isRoot: boolean
  isActive: boolean
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
  isInFocus: boolean
  colorPreset: ColorPreset
  isSelectedVoicingTone: boolean
  shapeFocus: boolean
  selectedVoicingLabel?: string
  selectedWord: string
  arpeggioStepIndexes?: readonly number[]
  arpeggioStepCount: number
  isHovered: boolean
  onNoteHover: (noteKey: string | null) => void
  onNoteClick: (note: FretNote) => void
  quizMode: boolean
  quizState: "idle" | "correct" | "incorrect"
  isQuizTarget: boolean
  quizTargetOnly: boolean
  "aria-label": string
}

export const NoteCell = memo<NoteCellProps>(
  ({
    note,
    displayNote,
    interval,
    stringIndex,
    fret,
    noteKey,
    isRoot,
    isActive,
    showNoteNames,
    showIntervals,
    rootOnly,
    isInFocus,
    colorPreset,
    isSelectedVoicingTone,
    shapeFocus,
    selectedVoicingLabel,
    selectedWord,
    arpeggioStepIndexes,
    arpeggioStepCount,
    isHovered,
    onNoteHover,
    onNoteClick,
    quizMode,
    quizState,
    isQuizTarget,
    quizTargetOnly,
    "aria-label": ariaLabel,
  }) => {
    const handleMouseEnter = useCallback(() => {
      onNoteHover(noteKey)
    }, [noteKey, onNoteHover])
    const handleMouseLeave = useCallback(() => {
      onNoteHover(null)
    }, [onNoteHover])
    const handleClick = useCallback(() => {
      onNoteClick({
        string: stringIndex,
        fret,
        note,
        interval,
        isRoot,
        isActive,
      })
    }, [fret, interval, isActive, isRoot, note, onNoteClick, stringIndex])

    if (!isActive) return null
    if (rootOnly && !isRoot) return null
    if (quizTargetOnly && !isQuizTarget) return null

    const isArpeggioPathTone = arpeggioStepIndexes !== undefined
    const arpeggioStepLabel = arpeggioStepIndexes?.join(" · ")

    return (
      <Button
        variant="ghost"
        className={cn(
          "relative z-20 flex items-center justify-center rounded-full p-0 font-mono font-bold transition-[opacity,transform,box-shadow] duration-300 ease-out",
          quizMode
            ? "h-8 w-8 border border-[var(--border-2)] bg-[var(--surface)] text-sm text-[var(--foreground)] hover:scale-110 hover:border-[var(--foreground)]"
            : isRoot
              ? "h-10 w-10 text-xl ring-2 ring-offset-1"
              : "h-9 w-9 border text-lg",
          !quizMode && isRoot
            ? "bg-(--color-deg1) text-[#faf9f7] ring-(--color-deg1)"
            : !quizMode && interval
              ? INTERVAL_COLOR_CLASSES[interval]
              : undefined,
          RING_OFFSET_CLASSES[colorPreset],
          isSelectedVoicingTone &&
            "outline outline-2 outline-offset-2 outline-[var(--foreground)]",
          isHovered && "scale-110",
          (!isInFocus ||
            (shapeFocus && !isSelectedVoicingTone) ||
            (arpeggioStepCount > 0 && !isArpeggioPathTone && !isRoot)) &&
            "opacity-20",
          quizState === "correct" &&
            "border-[var(--color-deg4)] bg-[var(--color-deg4)] text-white",
          quizState === "incorrect" &&
            "border-[var(--destructive)] bg-[var(--destructive)] text-white",
          isQuizTarget &&
            "h-10 w-10 border-2 border-[var(--color-root)] bg-[var(--color-root)]/20 text-[var(--foreground)] ring-2 ring-[var(--color-root)]/35 disabled:opacity-100"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        disabled={quizTargetOnly}
        aria-label={
          isSelectedVoicingTone && selectedVoicingLabel
            ? `${ariaLabel}, ${selectedWord} ${selectedVoicingLabel}`
            : ariaLabel
        }
      >
        {quizMode
          ? isQuizTarget
            ? "?"
            : quizState === "idle"
              ? ""
              : displayNote ?? note
          : showIntervals && interval
            ? interval
            : showNoteNames
              ? displayNote ?? note
              : ""}
        {arpeggioStepLabel ? (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 min-w-4 rounded-full bg-[var(--foreground)] px-1 text-center text-[9px] leading-4 text-[var(--background)]"
          >
            {arpeggioStepLabel}
          </span>
        ) : null}
      </Button>
    )
  }
)

NoteCell.displayName = "NoteCell"
