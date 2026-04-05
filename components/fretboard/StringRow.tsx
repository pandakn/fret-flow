import { NoteCell } from "./NoteCell";
import type { FretNote } from "@/types/music";

interface StringRowProps {
  stringIndex: number;
  fretNotes: FretNote[];
  showNoteNames: boolean;
  showIntervals: boolean;
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
  hoveredNote,
  onNoteHover,
  onNoteClick,
  getNoteKey,
}: StringRowProps) {
  const stringNum = stringIndex + 1;
  const stringThickness = 1 + stringIndex * 0.5;

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
        className="absolute left-0 right-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"
        style={{
          height: `${stringThickness}px`,
          top: "50%",
          transform: "translateY(-50%)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
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
              className="flex-1 h-full flex items-center justify-center relative border-r border-gray-400/60"
            >
              <NoteCell
                note={note.note}
                interval={note.interval}
                isRoot={note.isRoot}
                isActive={note.isActive}
                showNoteNames={showNoteNames}
                showIntervals={showIntervals}
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
