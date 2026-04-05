import { NoteCell } from "./NoteCell";
import type { FretNote } from "@/types/music";
import type { ColorPreset } from "@/types/fretboard";
import { cn } from "@/lib/utils";

interface StringRowProps {
  stringIndex: number;
  fretNotes: FretNote[];
  showNoteNames: boolean;
  showIntervals: boolean;
  colorPreset: ColorPreset;
  hoveredNote: string | null;
  onNoteHover: (key: string | null) => void;
  onNoteClick: (note: FretNote) => void;
  getNoteKey: (stringIdx: number, fret: number) => string;
}

export function StringRow({
  stringIndex,
  fretNotes,
  showNoteNames,
  showIntervals,
  colorPreset,
  hoveredNote,
  onNoteHover,
  onNoteClick,
  getNoteKey,
}: StringRowProps) {
  const stringNum = stringIndex + 1;
  const stringThickness = 1 + stringIndex * 0.5;

  const getPresetFretlineColor = (preset: ColorPreset) => {
    const colors: Record<ColorPreset, string> = {
      natural: "var(--fretboard-natural-fretline)",
      light: "var(--fretboard-light-fretline)",
      dark: "var(--fretboard-dark-fretline)",
      blue: "var(--fretboard-blue-fretline)",
      purple: "var(--fretboard-purple-fretline)",
      green: "var(--fretboard-green-fretline)",
      red: "var(--fretboard-red-fretline)",
    };
    return colors[preset];
  };

  const getPresetStringColor = (preset: ColorPreset) => {
    const colors: Record<ColorPreset, string> = {
      natural: "from-gray-400 via-gray-300 to-gray-400",
      light: "from-gray-600 via-gray-500 to-gray-600",
      dark: "from-gray-400 via-gray-300 to-gray-400",
      blue: "from-blue-400 via-blue-300 to-blue-400",
      purple: "from-purple-400 via-purple-300 to-purple-400",
      green: "from-green-400 via-green-300 to-green-400",
      red: "from-red-400 via-red-300 to-red-400",
    };
    return colors[preset];
  };

  const fretBorderColor = getPresetFretlineColor(colorPreset);
  const isLightPreset = colorPreset === "light";
  const stringColor = getPresetStringColor(colorPreset);

  return (
    <div className="flex items-center h-14 relative">
      {/* Open string note area */}
      <div className="w-16 h-full flex items-center justify-center relative shrink-0">
        {(() => {
          const openNote = fretNotes.find((n) => n.fret === 0);
          if (!openNote) return null;

          const noteKey = getNoteKey(stringIndex, 0);
          return (
            <NoteCell
              note={openNote.note}
              interval={openNote.interval}
              isRoot={openNote.isRoot}
              isActive={openNote.isActive}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              colorPreset={colorPreset}
              isHovered={hoveredNote === noteKey}
              onHover={(hovering) => onNoteHover(hovering ? noteKey : null)}
              onClick={() => onNoteClick(openNote)}
              aria-label={`${openNote.note}, ${openNote.interval || "note"}, fret 0 string ${stringNum}`}
            />
          );
        })()}
      </div>

      {/* String line */}
      <div
        className={cn("absolute left-0 right-0 bg-gradient-to-r", stringColor)}
        style={{
          height: `${stringThickness}px`,
          top: "50%",
          transform: "translateY(-50%)",
          boxShadow: isLightPreset ? "0 1px 2px rgba(0,0,0,0.2)" : "0 1px 2px rgba(0,0,0,0.3)",
        }}
      />

      {/* Frets with notes */}
      {fretNotes
        .filter((n) => n.fret > 0)
        .map((note) => {
          const noteKey = getNoteKey(stringIndex, note.fret);
          return (
            <div
              key={note.fret}
              className="flex-1 h-full flex items-center justify-center relative border-r"
              style={{
                borderColor: fretBorderColor,
              }}
            >
              <NoteCell
                note={note.note}
                interval={note.interval}
                isRoot={note.isRoot}
                isActive={note.isActive}
                showNoteNames={showNoteNames}
                showIntervals={showIntervals}
                colorPreset={colorPreset}
                isHovered={hoveredNote === noteKey}
                onHover={(hovering) => onNoteHover(hovering ? noteKey : null)}
                onClick={() => onNoteClick(note)}
                aria-label={`${note.note}, ${note.interval || "note"}, fret ${note.fret} string ${stringNum}`}
              />
            </div>
          );
        })}
    </div>
  );
}
