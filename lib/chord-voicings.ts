import type { NoteName } from "@/types/music"
import { getChordById, getChordNotes, type ChordType } from "./chords"
import { getNoteAtFret, CHROMATIC } from "./notes"
import type { Tuning } from "./tunings"

export type ChordVoicingPosition = "open" | "barre" | "up-neck"
export type FretOrMute = number | null
export type FretSlots = [
  FretOrMute,
  FretOrMute,
  FretOrMute,
  FretOrMute,
  FretOrMute,
  FretOrMute,
]

type ChordVoicingTemplateBase = {
  id: string
  chordId: string
  label: string
  position: ChordVoicingPosition
  tuningId: string
  barre?: {
    fromString: number
    toString: number
    fretOffset: number
  }
}

export type CuratedOpenChordVoicingTemplate = ChordVoicingTemplateBase & {
  kind: "curated-open"
  root: NoteName
  frets: FretSlots
}

export type RootAnchoredChordVoicingTemplate = ChordVoicingTemplateBase & {
  kind: "root-anchored"
  anchorString: number
  octave: number
  fretOffsets: FretSlots
}

export type ChordVoicingTemplate =
  | CuratedOpenChordVoicingTemplate
  | RootAnchoredChordVoicingTemplate

export type ChordVoicing = {
  id: string
  chordId: string
  root: NoteName
  label: string
  position: ChordVoicingPosition
  tuningId: string
  frets: FretSlots
  barre?: {
    fromString: number
    toString: number
    fret: number
  }
  activePositions: Array<{
    string: number
    fret: number
  }>
}

export type ChordVoicingFretRange = {
  min: number
  max: number
}

/** Matches the inclusive fret range rendered by FretboardPanel. */
export const DEFAULT_CHORD_VOICING_FRET_RANGE: ChordVoicingFretRange = {
  min: 0,
  max: 21,
}

const openShape = (
  chordId: string,
  root: NoteName,
  label: string,
  frets: FretSlots
): CuratedOpenChordVoicingTemplate => ({
  id: `${chordId}-${root.toLowerCase()}-open`,
  chordId,
  label,
  position: "open",
  tuningId: "standard",
  kind: "curated-open",
  root,
  frets,
})

const getCompatibleBarre = (
  frets: FretSlots,
  fromString: number
): ChordVoicingTemplateBase["barre"] => {
  let toString = frets.length - 1
  while (toString >= fromString && frets[toString] === null) {
    toString -= 1
  }

  if (
    toString <= fromString ||
    frets[fromString] !== 0 ||
    frets[toString] !== 0 ||
    frets
      .slice(fromString, toString + 1)
      .some((fret) => fret === null || fret < 0)
  ) {
    return undefined
  }

  return { fromString, toString, fretOffset: 0 }
}

const aShape = (
  chordId: string,
  frets: FretSlots
): RootAnchoredChordVoicingTemplate => ({
  id: `${chordId}-a-shape-barre`,
  chordId,
  label: "A-shape barre",
  position: "barre",
  tuningId: "standard",
  kind: "root-anchored",
  anchorString: 1,
  octave: 0,
  fretOffsets: frets,
  barre: getCompatibleBarre(frets, 1),
})

const eShape = (
  chordId: string,
  frets: FretSlots
): RootAnchoredChordVoicingTemplate => ({
  id: `${chordId}-e-shape-up-neck`,
  chordId,
  label: "E-shape up neck",
  position: "up-neck",
  tuningId: "standard",
  kind: "root-anchored",
  anchorString: 0,
  octave: 1,
  fretOffsets: frets,
  barre: getCompatibleBarre(frets, 0),
})

const SHAPES: Record<
  string,
  { open: FretSlots; barre: FretSlots; upNeck: FretSlots }
> = {
  major: {
    open: [0, 2, 2, 1, 0, 0],
    barre: [null, 0, 2, 2, 2, 0],
    upNeck: [0, 2, 2, 1, 0, 0],
  },
  minor: {
    open: [0, 2, 2, 0, 0, 0],
    barre: [null, 0, 2, 2, 1, 0],
    upNeck: [0, 2, 2, 0, 0, 0],
  },
  dominant_7: {
    open: [0, 2, 0, 1, 0, 0],
    barre: [null, 0, 2, 0, 2, 0],
    upNeck: [0, 2, 0, 1, 0, 0],
  },
  minor_7: {
    open: [0, 2, 0, 0, 0, 0],
    barre: [null, 0, 2, 0, 1, 0],
    upNeck: [0, 2, 0, 0, 0, 0],
  },
  major_7: {
    open: [0, 2, 1, 1, 0, 0],
    barre: [null, 0, 2, 1, 2, 0],
    upNeck: [0, 2, 1, 1, 0, 0],
  },
  diminished: {
    open: [0, 1, 2, 0, null, null],
    barre: [null, 0, 1, 2, 1, null],
    upNeck: [0, 1, 2, 0, null, null],
  },
  augmented: {
    open: [0, 3, 2, 1, 1, 0],
    barre: [null, 0, 3, 2, 2, null],
    upNeck: [0, 3, 2, 1, 1, 0],
  },
  sus2: {
    open: [0, 2, 4, 4, 0, 0],
    barre: [null, 0, 2, 2, 0, 0],
    upNeck: [0, 2, 4, 4, 0, 0],
  },
  sus4: {
    open: [0, 2, 2, 2, 0, 0],
    barre: [null, 0, 2, 2, 3, 0],
    upNeck: [0, 2, 2, 2, 0, 0],
  },
}

export const CHORD_VOICING_TEMPLATES: ChordVoicingTemplate[] = Object.entries(
  SHAPES
).flatMap(([chordId, shapes]) => [
  openShape(chordId, "E", "E open shape", shapes.open),
  aShape(chordId, shapes.barre),
  eShape(chordId, shapes.upNeck),
]).concat([
  openShape("major", "A", "A open shape", [null, 0, 2, 2, 2, 0]),
  openShape("minor", "A", "Am open shape", [null, 0, 2, 2, 1, 0]),
  openShape("dominant_7", "A", "A7 open shape", [null, 0, 2, 0, 2, 0]),
  openShape("minor_7", "A", "Am7 open shape", [null, 0, 2, 0, 1, 0]),
  openShape("major_7", "A", "Amaj7 open shape", [null, 0, 2, 1, 2, 0]),
  openShape("major", "C", "C open shape", [null, 3, 2, 0, 1, 0]),
  openShape("dominant_7", "C", "C7 open shape", [null, 3, 2, 3, 1, 0]),
  openShape("major_7", "C", "Cmaj7 open shape", [null, 3, 2, 0, 0, 0]),
  openShape("major", "D", "D open shape", [null, null, 0, 2, 3, 2]),
  openShape("minor", "D", "Dm open shape", [null, null, 0, 2, 3, 1]),
  openShape("dominant_7", "D", "D7 open shape", [null, null, 0, 2, 1, 2]),
  openShape("minor_7", "D", "Dm7 open shape", [null, null, 0, 2, 1, 1]),
  openShape("major_7", "D", "Dmaj7 open shape", [null, null, 0, 2, 2, 2]),
  openShape("major", "G", "G open shape", [3, 2, 0, 0, 0, 3]),
  openShape("dominant_7", "G", "G7 open shape", [3, 2, 0, 0, 0, 1]),
  openShape("major_7", "G", "Gmaj7 open shape", [3, 2, 0, 0, 0, 2]),
])

const getRootFret = (
  root: NoteName,
  openString: NoteName,
  octave: number
): number => {
  const semitones =
    (CHROMATIC.indexOf(root) -
      CHROMATIC.indexOf(openString) +
      CHROMATIC.length) %
    CHROMATIC.length
  return semitones + octave * CHROMATIC.length
}

const getHighestFittingAnchorFret = (
  template: RootAnchoredChordVoicingTemplate,
  root: NoteName,
  tuning: Tuning,
  fretRange: ChordVoicingFretRange
): number | undefined => {
  for (
    let anchorFret = getRootFret(
      root,
      tuning.strings[template.anchorString],
      template.octave
    );
    anchorFret >= fretRange.min;
    anchorFret -= CHROMATIC.length
  ) {
    if (
      template.fretOffsets.every(
        (offset) =>
          offset === null ||
          isWithinRange(anchorFret + offset, fretRange)
      )
    ) {
      return anchorFret
    }
  }

  return undefined
}

const isWithinRange = (
  fret: number,
  fretRange: ChordVoicingFretRange
): boolean =>
  Number.isInteger(fret) && fret >= fretRange.min && fret <= fretRange.max

const isSixStringTuning = (tuning: Tuning): boolean =>
  tuning.strings.length === 6

const isValidStringIndex = (string: number, tuning: Tuning): boolean =>
  Number.isInteger(string) && string >= 0 && string < tuning.strings.length

export const isChordVoicingTemplateCompatible = (
  template: ChordVoicingTemplate,
  root: NoteName,
  chord: ChordType,
  tuning: Tuning
): boolean =>
  template.chordId === chord.id &&
  template.tuningId === tuning.id &&
  isSixStringTuning(tuning) &&
  (template.kind !== "root-anchored" ||
    isValidStringIndex(template.anchorString, tuning)) &&
  (template.kind !== "curated-open" || template.root === root)

export const resolveChordVoicing = (
  template: ChordVoicingTemplate,
  root: NoteName,
  chord: ChordType,
  tuning: Tuning,
  fretRange: ChordVoicingFretRange = DEFAULT_CHORD_VOICING_FRET_RANGE
): ChordVoicing | undefined => {
  if (!isChordVoicingTemplateCompatible(template, root, chord, tuning)) {
    return undefined
  }

  const anchorFret =
    template.kind === "root-anchored"
      ? getHighestFittingAnchorFret(template, root, tuning, fretRange)
      : undefined

  if (template.kind === "root-anchored" && anchorFret === undefined) {
    return undefined
  }

  const resolvedAnchorFret = anchorFret ?? 0

  const frets =
    template.kind === "curated-open"
      ? template.frets
      : (template.fretOffsets.map((offset) => {
          if (offset === null) return null
          return resolvedAnchorFret + offset
        }) as FretSlots)

  if (frets.some((fret) => fret !== null && !isWithinRange(fret, fretRange))) {
    return undefined
  }

  const activePositions = frets.flatMap((fret, string) =>
    fret === null ? [] : [{ string, fret }]
  )
  const resolved: ChordVoicing = {
    id: template.id,
    chordId: template.chordId,
    root,
    label: template.label,
    position: template.position,
    tuningId: template.tuningId,
    frets,
    barre: template.barre
      ? {
          fromString: template.barre.fromString,
          toString: template.barre.toString,
          fret:
            template.kind === "curated-open"
              ? template.barre.fretOffset
              : resolvedAnchorFret + template.barre.fretOffset,
        }
      : undefined,
    activePositions,
  }

  return isResolvedChordVoicingValid(resolved, chord, tuning, fretRange)
    ? resolved
    : undefined
}

/**
 * Returns only templates that match the chord/tuning and fit entirely within
 * the requested fret range. Curated open shapes are available only for their
 * authored root, so callers should omit position groups with no result.
 */
export const getChordVoicings = (
  root: NoteName,
  chordId: string,
  tuning: Tuning,
  fretRange: ChordVoicingFretRange = DEFAULT_CHORD_VOICING_FRET_RANGE
): ChordVoicing[] => {
  const chord = getChordById(chordId)
  if (!chord) return []

  return CHORD_VOICING_TEMPLATES.flatMap((template) => {
    const voicing = resolveChordVoicing(
      template,
      root,
      chord,
      tuning,
      fretRange
    )
    return voicing ? [voicing] : []
  })
}

export const isResolvedChordVoicingValid = (
  voicing: ChordVoicing,
  chord: ChordType,
  tuning: Tuning,
  fretRange: ChordVoicingFretRange = DEFAULT_CHORD_VOICING_FRET_RANGE
): boolean => {
  if (
    !isSixStringTuning(tuning) ||
    voicing.frets.length !== 6 ||
    voicing.activePositions.length === 0
  ) {
    return false
  }

  const expectedActivePositions = voicing.frets.flatMap((fret, string) =>
    fret === null ? [] : [{ string, fret }]
  )
  if (
    expectedActivePositions.length !== voicing.activePositions.length ||
    expectedActivePositions.some(
      (position, index) =>
        position.string !== voicing.activePositions[index]?.string ||
        position.fret !== voicing.activePositions[index]?.fret
    )
  ) {
    return false
  }

  if (voicing.barre) {
    const { fromString, toString, fret } = voicing.barre
    if (
      !isValidStringIndex(fromString, tuning) ||
      !isValidStringIndex(toString, tuning) ||
      fromString >= toString ||
      !isWithinRange(fret, fretRange) ||
      voicing.frets[fromString] !== fret ||
      voicing.frets[toString] !== fret
    ) {
      return false
    }

    for (let string = fromString; string <= toString; string++) {
      const stringFret = voicing.frets[string]
      if (stringFret === null || stringFret < fret) return false
    }
  }

  const chordTones = new Set(getChordNotes(voicing.root, chord.formula))
  let includesRoot = false

  for (let string = 0; string < voicing.frets.length; string++) {
    const fret = voicing.frets[string]
    if (fret === null) continue
    if (!isWithinRange(fret, fretRange)) return false

    const note = getNoteAtFret(tuning.strings[string], fret)
    if (!chordTones.has(note)) return false
    includesRoot ||= note === voicing.root
  }

  return includesRoot
}
