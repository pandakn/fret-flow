import { NoteCell } from "./NoteCell"
import type { FretNote, NoteName } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { intervalLabel } from "@/lib/i18n/music-labels"
import { messages } from "@/lib/i18n/messages"
import type { Locale } from "@/lib/i18n/locales"
import { spellIntervalNote } from "@/lib/theory/spelling"

interface StringRowProps {
  stringIndex: number
  fretNotes: FretNote[]
  displayRoot?: NoteName
  showNoteNames: boolean
  showIntervals: boolean
  rootOnly: boolean
  focusRange?: { min: number; max: number }
  colorPreset: ColorPreset
  selectedVoicingFrets?: ReadonlyMap<number, ReadonlySet<number>>
  selectedVoicingLabel?: string
  shapeFocus: boolean
  arpeggioPathSteps?: ReadonlyMap<string, readonly number[]>
  arpeggioStepCount: number
  hoveredNote: string | null
  onNoteHover: (key: string | null) => void
  onNoteClick: (note: FretNote) => void
  quizMode: boolean
  quizFeedback?: { key: string; status: "correct" | "incorrect" }
  quizTarget?: { string: number; fret: number }
}

const FRETLINE_BY_PRESET: Record<ColorPreset, string> = {
  minimal: "var(--fretboard-minimal-fret)",
  natural: "var(--fretboard-natural-fret)",
  light: "var(--fretboard-light-fret)",
  dark: "var(--fretboard-dark-fret)",
  blue: "var(--fretboard-blue-fret)",
  purple: "var(--fretboard-purple-fret)",
  green: "var(--fretboard-green-fret)",
  red: "var(--fretboard-red-fret)",
}

const STRING_BY_PRESET: Record<ColorPreset, string> = {
  minimal: "var(--fretboard-minimal-string)",
  natural: "var(--fretboard-natural-string)",
  light: "var(--fretboard-light-string)",
  dark: "var(--fretboard-dark-string)",
  blue: "var(--fretboard-blue-string)",
  purple: "var(--fretboard-purple-string)",
  green: "var(--fretboard-green-string)",
  red: "var(--fretboard-red-string)",
}

const getDisplayNote = (note: FretNote, displayRoot?: NoteName): string =>
  displayRoot && note.interval
    ? spellIntervalNote(displayRoot, note.interval, note.note)
    : note.note

const getAriaLabel = (
  note: FretNote,
  stringNum: number,
  locale: Locale,
  displayRoot?: NoteName
): string =>
  `${getDisplayNote(note, displayRoot)}, ${
    note.interval ? intervalLabel(locale, note.interval) : messages[locale].note
  }, ${messages[locale].fret} ${note.fret} ${messages[locale].string} ${stringNum}`

const getNoteKey = (stringIndex: number, fret: number): string =>
  `${stringIndex}-${fret}`

const getArpeggioPositionKey = (stringIndex: number, fret: number): string =>
  `${stringIndex}-${fret}`

const getArpeggioAriaLabel = (
  note: FretNote,
  stringNum: number,
  stepIndexes: readonly number[] | undefined,
  stepCount: number,
  locale: Locale,
  displayRoot?: NoteName
): string => {
  const baseLabel = getAriaLabel(note, stringNum, locale, displayRoot)
  if (!stepIndexes || stepIndexes.length === 0 || stepCount === 0) {
    return baseLabel
  }

  if (stepIndexes.length === 1) {
    return `${baseLabel}, ${messages[locale].arpeggioStep} ${stepIndexes[0]} / ${stepCount}`
  }

  return `${baseLabel}, ${messages[locale].arpeggioSteps} ${stepIndexes.join(", ")} / ${stepCount}`
}

export function StringRow({
  stringIndex,
  fretNotes,
  displayRoot,
  showNoteNames,
  showIntervals,
  rootOnly,
  focusRange,
  colorPreset,
  selectedVoicingFrets,
  selectedVoicingLabel,
  shapeFocus,
  arpeggioPathSteps,
  arpeggioStepCount,
  hoveredNote,
  onNoteHover,
  onNoteClick,
  quizMode,
  quizFeedback,
  quizTarget,
}: StringRowProps) {
  const { locale, t } = useI18n()
  const stringNum = stringIndex + 1
  const stringThickness = 0.5 + stringIndex * 0.25

  const fretBorderColor = FRETLINE_BY_PRESET[colorPreset]
  const stringColor = STRING_BY_PRESET[colorPreset]
  const rowHeight = "h-14"
  const sourceStringIndex = fretNotes[0]?.string
  const selectedFrets =
    sourceStringIndex === undefined
      ? undefined
      : selectedVoicingFrets?.get(sourceStringIndex)
  const openNote = fretNotes.find((note) => note.fret === 0)
  const openNoteKey = getNoteKey(stringIndex, 0)
  const openArpeggioStepIndexes = openNote
    ? arpeggioPathSteps?.get(
        getArpeggioPositionKey(openNote.string, openNote.fret)
      )
    : undefined

  return (
    <div className={cn("relative flex items-center", rowHeight)}>
      <div className="relative flex h-full w-14 shrink-0 items-center justify-center">
        {openNote ? (
          <NoteCell
            note={openNote.note}
            displayNote={getDisplayNote(openNote, displayRoot)}
            interval={openNote.interval}
            stringIndex={openNote.string}
            fret={openNote.fret}
            noteKey={openNoteKey}
            isRoot={openNote.isRoot}
            isActive={openNote.isActive}
            showNoteNames={showNoteNames}
            showIntervals={showIntervals}
            rootOnly={rootOnly}
            isInFocus={
              !focusRange ||
              (openNote.fret >= focusRange.min &&
                openNote.fret <= focusRange.max)
            }
            colorPreset={colorPreset}
            isSelectedVoicingTone={selectedFrets?.has(openNote.fret) ?? false}
            shapeFocus={shapeFocus}
            arpeggioStepIndexes={openArpeggioStepIndexes}
            arpeggioStepCount={arpeggioStepCount}
            selectedVoicingLabel={selectedVoicingLabel}
            selectedWord={t("selected")}
            isHovered={hoveredNote === openNoteKey}
            onNoteHover={onNoteHover}
            onNoteClick={onNoteClick}
            quizMode={quizMode}
            quizState={
              quizFeedback?.key === `${openNote.string}-${openNote.fret}`
                ? quizFeedback.status
                : "idle"
            }
            isQuizTarget={
              quizTarget?.string === openNote.string &&
              quizTarget.fret === openNote.fret
            }
            quizTargetOnly={quizTarget !== undefined}
            aria-label={
              quizTarget?.string === openNote.string &&
              quizTarget.fret === openNote.fret
                ? `${t("targetPosition")}, ${t("fret")} ${openNote.fret} ${t("string")} ${openNote.string + 1}`
                : quizMode
                  ? `${t("hiddenAnswer")}, ${t("fret")} ${openNote.fret} ${t("string")} ${stringNum}`
                  : getArpeggioAriaLabel(
                      openNote,
                      stringNum,
                      openArpeggioStepIndexes,
                      arpeggioStepCount,
                      locale,
                      displayRoot
                    )
            }
          />
        ) : null}
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
          const arpeggioStepIndexes = arpeggioPathSteps?.get(
            getArpeggioPositionKey(note.string, note.fret)
          )
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
                displayNote={getDisplayNote(note, displayRoot)}
                interval={note.interval}
                stringIndex={note.string}
                fret={note.fret}
                noteKey={noteKey}
                isRoot={note.isRoot}
                isActive={note.isActive}
                showNoteNames={showNoteNames}
                showIntervals={showIntervals}
                rootOnly={rootOnly}
                isInFocus={
                  !focusRange ||
                  (note.fret >= focusRange.min && note.fret <= focusRange.max)
                }
                colorPreset={colorPreset}
                isSelectedVoicingTone={selectedFrets?.has(note.fret) ?? false}
                shapeFocus={shapeFocus}
                arpeggioStepIndexes={arpeggioStepIndexes}
                arpeggioStepCount={arpeggioStepCount}
                selectedVoicingLabel={selectedVoicingLabel}
                selectedWord={t("selected")}
                isHovered={hoveredNote === noteKey}
                onNoteHover={onNoteHover}
                onNoteClick={onNoteClick}
                quizMode={quizMode}
                quizState={
                  quizFeedback?.key === `${note.string}-${note.fret}`
                    ? quizFeedback.status
                    : "idle"
                }
                isQuizTarget={
                  quizTarget?.string === note.string &&
                  quizTarget.fret === note.fret
                }
                quizTargetOnly={quizTarget !== undefined}
                aria-label={
                  quizTarget?.string === note.string &&
                  quizTarget.fret === note.fret
                    ? `${t("targetPosition")}, ${t("fret")} ${note.fret} ${t("string")} ${note.string + 1}`
                    : quizMode
                      ? `${t("hiddenAnswer")}, ${t("fret")} ${note.fret} ${t("string")} ${stringNum}`
                      : getArpeggioAriaLabel(
                          note,
                          stringNum,
                          arpeggioStepIndexes,
                          arpeggioStepCount,
                          locale,
                          displayRoot
                        )
                }
              />
            </div>
          )
        })}
    </div>
  )
}
