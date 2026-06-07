import { NoteCell } from "./NoteCell"
import type { FretNote } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"
import { cn } from "@/lib/utils"

interface StringRowProps {
  stringIndex: number
  fretNotes: FretNote[]
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
  colorPreset: ColorPreset
  hoveredNote: string | null
  onNoteHover: (key: string | null) => void
  onNoteClick: (note: FretNote) => void
  getNoteKey: (stringIdx: number, fret: number) => string
}

const FRETLINE_BY_PRESET: Record<ColorPreset, string> = {
  minimal: "var(--fretboard-minimal-fret)",
  natural: "var(--fretboard-natural-fretline)",
  light: "var(--fretboard-light-fretline)",
  dark: "var(--fretboard-dark-fretline)",
  blue: "var(--fretboard-blue-fretline)",
  purple: "var(--fretboard-purple-fretline)",
  green: "var(--fretboard-green-fretline)",
  red: "var(--fretboard-red-fretline)",
}

const STRING_BY_PRESET: Record<ColorPreset, string> = {
  minimal: "var(--fretboard-minimal-string)",
  natural: "var(--fretboard-natural-fretline)",
  light: "var(--fretboard-light-fretline)",
  dark: "var(--fretboard-dark-fretline)",
  blue: "var(--fretboard-blue-fretline)",
  purple: "var(--fretboard-purple-fretline)",
  green: "var(--fretboard-green-fretline)",
  red: "var(--fretboard-red-fretline)",
}

export function StringRow({
  stringIndex,
  fretNotes,
  showNoteNames,
  showIntervals,
  rootOnly,
  colorPreset,
  hoveredNote,
  onNoteHover,
  onNoteClick,
  getNoteKey,
}: StringRowProps) {
  const stringNum = stringIndex + 1
  const stringThickness = 0.5 + stringIndex * 0.25
  const isMinimal = colorPreset === "minimal"

  const fretBorderColor = FRETLINE_BY_PRESET[colorPreset]
  const stringColor = STRING_BY_PRESET[colorPreset]
  const rowHeight = isMinimal ? "h-[24px]" : "h-14"

  return (
    <div className={cn("relative flex items-center", rowHeight)}>
      <div className="relative flex h-full w-14 shrink-0 items-center justify-center">
        {(() => {
          const openNote = fretNotes.find((n) => n.fret === 0)
          if (!openNote) return null

          const noteKey = getNoteKey(stringIndex, 0)
          return (
            <NoteCell
              note={openNote.note}
              interval={openNote.interval}
              isRoot={openNote.isRoot}
              isActive={openNote.isActive}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              rootOnly={rootOnly}
              colorPreset={colorPreset}
              isHovered={hoveredNote === noteKey}
              onHover={(hovering) => onNoteHover(hovering ? noteKey : null)}
              onClick={() => onNoteClick(openNote)}
              aria-label={`${openNote.note}, ${openNote.interval || "note"}, fret 0 string ${stringNum}`}
            />
          )
        })()}
      </div>

      <div
        className="absolute right-0 left-0"
        style={{
          height: `${stringThickness}px`,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: stringColor,
        }}
      />

      {fretNotes
        .filter((n) => n.fret > 0)
        .map((note) => {
          const noteKey = getNoteKey(stringIndex, note.fret)
          return (
            <div
              key={note.fret}
              className="relative flex h-full flex-1 items-center justify-center"
              style={{
                borderRight: `1px solid ${fretBorderColor}`,
              }}
            >
              <NoteCell
                note={note.note}
                interval={note.interval}
                isRoot={note.isRoot}
                isActive={note.isActive}
                showNoteNames={showNoteNames}
                showIntervals={showIntervals}
                rootOnly={rootOnly}
                colorPreset={colorPreset}
                isHovered={hoveredNote === noteKey}
                onHover={(hovering) => onNoteHover(hovering ? noteKey : null)}
                onClick={() => onNoteClick(note)}
                aria-label={`${note.note}, ${note.interval || "note"}, fret ${note.fret} string ${stringNum}`}
              />
            </div>
          )
        })}
    </div>
  )
}
