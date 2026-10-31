"use client"

import {
  DisplayOptions,
  type DisplayMode,
} from "@/components/controls/DisplayOptions"
import { FretboardPanel } from "@/components/layout/FretboardPanel"
import { Legend } from "@/components/layout/Legend"
import { Navbar, type ExplorerMode } from "@/components/layout/Navbar"
import {
  PositionTabs,
  POSITION_RANGES,
  type PositionId,
} from "@/components/layout/PositionTabs"
import { RelatedScales } from "@/components/layout/RelatedScales"
import { Playback } from "@/components/layout/Playback"
import { ArpeggioControls } from "@/components/layout/ArpeggioControls"
import {
  ChordVoicingSelector,
  type ChordDisplayMode,
} from "@/components/layout/ChordVoicingSelector"
import {
  findNearestVoicing,
  getChordVoicings,
  getTriadVoicings,
} from "@/lib/chord-voicings"
import { CHORDS, getChordById, getTriadChordTypes } from "@/lib/chords"
import { resolveArpeggio, type ArpeggioDirection } from "@/lib/arpeggios"
import {
  getModeById,
  getScaleById,
  MODES,
  SCALES,
  getScaleNotes,
} from "@/lib/scales"
import { getTuningById, TUNINGS } from "@/lib/tunings"
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { useEffect, useMemo, useRef, useState } from "react"
import { createDefaultExercise } from "@/lib/practice/exercises"
import { usePracticeStore } from "@/components/practice/hooks/usePracticeStore"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { ScaleRouteStudy } from "@/components/explorer/ScaleRouteStudy"
import { CHROMATIC } from "@/lib/notes"
import { getKeyLabel, spellIntervalNote } from "@/lib/theory/spelling"
import { chordLabel, scaleLabel } from "@/lib/i18n/music-labels"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { localePath } from "@/lib/i18n/locales"
import { routeText } from "@/lib/i18n/note-routes"
import {
  getDiatonicChords,
  type DiatonicChordKind,
} from "@/lib/theory/diatonic"
import { spellNoteInKey } from "@/lib/theory/spelling"
import { Button } from "@/components/ui/button"

const TRIAD_CHORD_TYPES = getTriadChordTypes()

export function Explorer() {
  const { t, locale } = useI18n()
  const { saveExercise } = usePracticeStore()
  const [root, setRoot] = useState<NoteName>("C")
  const [mode, setMode] = useState<ExplorerMode>("scales")
  const [scaleId, setScaleId] = useState("major")
  const [chordId, setChordId] = useState("major")
  const [selectedVoicingId, setSelectedVoicingId] = useState<string>()
  const [mutedStringOverrides, setMutedStringOverrides] = useState<
    Record<string, Record<number, boolean>>
  >({})
  const [chordDisplayMode, setChordDisplayMode] =
    useState<ChordDisplayMode>("toneMap")
  const [triadId, setTriadId] = useState("major")
  const [diatonicKey, setDiatonicKey] = useState<NoteName>("C")
  const [diatonicKind, setDiatonicKind] = useState<DiatonicChordKind>("triad")
  const [selectedTriadVoicingId, setSelectedTriadVoicingId] = useState<string>()
  const pendingDiatonicVoicing = useRef<{
    mode: "chords" | "triads"
    id?: string
  } | null>(null)
  const [triadDisplayMode, setTriadDisplayMode] =
    useState<ChordDisplayMode>("toneMap")
  const [arpeggioChordId, setArpeggioChordId] = useState("major")
  const [selectedArpeggioVoicingId, setSelectedArpeggioVoicingId] =
    useState<string>()
  const [arpeggioDirection, setArpeggioDirection] =
    useState<ArpeggioDirection>("ascending")
  const [tuningId, setTuningId] = useState("standard")
  const colorPreset: ColorPreset = "minimal"
  const [displayMode, setDisplayMode] = useState<DisplayMode>("notes")
  const [position, setPosition] = useState<PositionId>("full")
  const [focusMode, setFocusMode] = useState(false)
  const [guidedRoutesOpen, setGuidedRoutesOpen] = useState(false)
  const showNoteNames = displayMode === "notes"
  const showIntervals = displayMode === "degrees"
  const rootOnly = displayMode === "rootOnly"
  const isScaleExplorer = mode === "scales" || mode === "modes"
  const focusRange =
    isScaleExplorer && focusMode ? POSITION_RANGES[position] : undefined
  const selectedScale = getScaleById(scaleId)
  const selectedChord = getChordById(chordId)
  const selectedTriad = getChordById(triadId)
  const selectedArpeggioChord = getChordById(arpeggioChordId)
  const selectedTuning = getTuningById(tuningId)
  const chordVoicings = useMemo(
    () =>
      selectedTuning ? getChordVoicings(root, chordId, selectedTuning) : [],
    [chordId, root, selectedTuning]
  )
  const baseSelectedVoicing = chordVoicings.find(
    (voicing) => voicing.id === selectedVoicingId
  )
  const selectedVoicing = useMemo(() => {
    if (!baseSelectedVoicing) return undefined
    const overrides = mutedStringOverrides[baseSelectedVoicing.id]
    if (!overrides || Object.keys(overrides).length === 0)
      return baseSelectedVoicing
    const frets = [
      ...baseSelectedVoicing.frets,
    ] as typeof baseSelectedVoicing.frets
    for (const [stringKey, muted] of Object.entries(overrides)) {
      const string = Number(stringKey)
      if (muted) frets[string] = null
      else if (frets[string] === null) frets[string] = 0
    }
    const activePositions = baseSelectedVoicing.activePositions.filter(
      ({ string }) => frets[string] !== null
    )
    for (const [stringKey, muted] of Object.entries(overrides)) {
      const string = Number(stringKey)
      if (
        !muted &&
        !baseSelectedVoicing.activePositions.some(
          (position) => position.string === string
        )
      ) {
        activePositions.push({ string, fret: 0 })
      }
    }
    return { ...baseSelectedVoicing, frets, activePositions }
  }, [baseSelectedVoicing, mutedStringOverrides])
  const triadVoicings = useMemo(
    () =>
      selectedTuning ? getTriadVoicings(root, triadId, selectedTuning) : [],
    [root, selectedTuning, triadId]
  )
  const selectedTriadVoicing = triadVoicings.find(
    (voicing) => voicing.id === selectedTriadVoicingId
  )
  const displayedTriadVoicing = useMemo(() => {
    if (!selectedTriadVoicing) return undefined
    const overrides = mutedStringOverrides[selectedTriadVoicing.id]
    if (!overrides || Object.keys(overrides).length === 0)
      return selectedTriadVoicing
    const frets = [
      ...selectedTriadVoicing.frets,
    ] as typeof selectedTriadVoicing.frets
    for (const [stringKey, muted] of Object.entries(overrides)) {
      const string = Number(stringKey)
      if (muted) frets[string] = null
      else if (frets[string] === null) frets[string] = 0
    }
    const activePositions = selectedTriadVoicing.activePositions.filter(
      ({ string }) => frets[string] !== null
    )
    for (const [stringKey, muted] of Object.entries(overrides)) {
      const string = Number(stringKey)
      if (
        !muted &&
        !selectedTriadVoicing.activePositions.some(
          (position) => position.string === string
        )
      ) {
        activePositions.push({ string, fret: 0 })
      }
    }
    return { ...selectedTriadVoicing, frets, activePositions }
  }, [mutedStringOverrides, selectedTriadVoicing])
  const arpeggioVoicings = useMemo(
    () =>
      selectedTuning
        ? getChordVoicings(root, arpeggioChordId, selectedTuning)
        : [],
    [arpeggioChordId, root, selectedTuning]
  )
  const selectedArpeggioVoicing = arpeggioVoicings.find(
    (voicing) => voicing.id === selectedArpeggioVoicingId
  )
  const resolvedArpeggio = useMemo(
    () =>
      selectedArpeggioChord && selectedTuning && selectedArpeggioVoicing
        ? resolveArpeggio(
            selectedArpeggioVoicing,
            selectedArpeggioChord,
            selectedTuning,
            arpeggioDirection
          )
        : undefined,
    [
      arpeggioDirection,
      selectedArpeggioChord,
      selectedArpeggioVoicing,
      selectedTuning,
    ]
  )
  const isChordExplorer = mode === "chords" || mode === "triads"
  const activeDiatonicKind = mode === "triads" ? "triad" : diatonicKind
  const diatonicChords = getDiatonicChords(diatonicKey, activeDiatonicKind)
  const selectedChordPattern = mode === "triads" ? selectedTriad : selectedChord
  const selectedPattern = isScaleExplorer
    ? selectedScale
    : mode === "arpeggios"
      ? selectedArpeggioChord
      : selectedChordPattern
  const activeVoicing =
    mode === "triads" ? displayedTriadVoicing : selectedVoicing
  const activeChordDisplayMode =
    mode === "triads" ? triadDisplayMode : chordDisplayMode
  const selectedVoicingForControls =
    mode === "triads" ? displayedTriadVoicing : selectedVoicing
  const toggleMutedString = (string: number) => {
    if (!selectedVoicingForControls) return
    const id = selectedVoicingForControls.id
    setMutedStringOverrides((current) => {
      const isMuted = selectedVoicingForControls.frets[string] === null
      return {
        ...current,
        [id]: { ...current[id], [string]: !isMuted },
      }
    })
  }
  const heading = isScaleExplorer
    ? `${getKeyLabel(root)} ${selectedScale ? scaleLabel(locale, selectedScale.id, selectedScale.name) : ""}`
    : mode === "arpeggios"
      ? `${getKeyLabel(root)}${selectedArpeggioChord?.symbol ?? ""} ${t("arpeggios")}`
      : `${getKeyLabel(root)}${selectedChordPattern?.symbol ?? ""} ${selectedChordPattern ? chordLabel(locale, selectedChordPattern.id, selectedChordPattern.name) : ""}`
  const noteSummary =
    isScaleExplorer && selectedScale
      ? getScaleNotes(root, selectedScale.formula)
          .map((note, index) =>
            spellIntervalNote(root, selectedScale.intervals[index], note)
          )
          .join(" · ")
      : (selectedChordPattern?.intervals.join(" · ") ??
        selectedArpeggioChord?.intervals.join(" · ") ??
        "")

  useEffect(() => {
    // Root, chord, and tuning define the playable set, so always select its
    // first valid entry rather than retaining a possibly stale template ID.
    const pending = pendingDiatonicVoicing.current
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVoicingId(
      pending?.mode === "chords" ? pending.id : chordVoicings[0]?.id
    )
    if (pending?.mode === "chords") pendingDiatonicVoicing.current = null
  }, [chordId, chordVoicings, root, tuningId])

  useEffect(() => {
    // Triad voicings are independent from the chord explorer selection.
    const pending = pendingDiatonicVoicing.current
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTriadVoicingId(
      pending?.mode === "triads" ? pending.id : triadVoicings[0]?.id
    )
    if (pending?.mode === "triads") pendingDiatonicVoicing.current = null
  }, [root, triadId, triadVoicings, tuningId])

  useEffect(() => {
    // Arpeggio voicings are independent from the chord explorer selection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedArpeggioVoicingId(arpeggioVoicings[0]?.id)
  }, [arpeggioChordId, arpeggioVoicings, root, tuningId])

  const handlePositionChange = (nextPosition: PositionId) => {
    setPosition(nextPosition)
    setFocusMode(nextPosition !== "full")
  }

  const handleExplorerModeChange = (nextMode: ExplorerMode) => {
    if (nextMode === "modes" && !getModeById(scaleId)) {
      setScaleId(MODES[0].id)
    }
    setMode(nextMode)
  }

  const handleSaveExercise = () => {
    if (isScaleExplorer) {
      const base = createDefaultExercise("technique")
      if (base.kind !== "technique") return
      saveExercise({
        ...base,
        name: `${root} ${selectedScale?.name ?? "scale"} practice`,
        description: `Practice the current ${mode === "modes" ? "mode" : "scale"} selection with a steady click.`,
        root,
        scaleId,
      })
      return
    }

    if (mode === "arpeggios") {
      const base = createDefaultExercise("technique")
      if (base.kind !== "technique") return
      saveExercise({
        ...base,
        name: `${root}${selectedArpeggioChord?.symbol ?? ""} arpeggio`,
        description:
          "Practice the selected arpeggio shape with even articulation.",
        technique: "arpeggio",
        root,
        scaleId: arpeggioChordId,
      })
      return
    }

    const base = createDefaultExercise("construction")
    if (base.kind !== "construction") return
    saveExercise({
      ...base,
      name: `${root}${selectedChordPattern?.symbol ?? ""} construction`,
      description:
        "Recall and construct the selected chord tones across the neck.",
      category: mode === "triads" ? "triad" : "seventh",
      skillIds: [mode === "triads" ? "triad.construct" : "seventh.construct"],
      root,
    })
  }

  if (
    guidedRoutesOpen &&
    mode === "scales" &&
    (scaleId === "pentatonic_major" || scaleId === "pentatonic_minor")
  ) {
    return (
      <ScaleRouteStudy
        root={root}
        scaleId={scaleId}
        onClose={() => setGuidedRoutesOpen(false)}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-4 px-5 pt-6 pb-28 sm:px-8 lg:px-12">
        <section className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <p className="font-mono text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
              {t("scales")} / {t("explore")}
            </p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-balance text-[var(--foreground)] sm:text-5xl">
              {heading}
            </h1>
            <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
              {noteSummary} <span className="px-2">|</span>{" "}
              {selectedPattern?.intervals.length ?? 0}{" "}
              {isScaleExplorer ? t("notes") : t("tones")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveExercise}
              className="rounded-xl border border-[var(--border-2)] bg-[var(--card)] px-4 py-3 text-sm font-semibold hover:bg-[var(--secondary)]"
            >
              {t("saveExercise")}
            </button>
            <Link
              href={localePath(locale, "/practice")}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)]"
            >
              {t("practice")} →
            </Link>
          </div>
        </section>

        <section
          className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] pb-2"
          aria-label="Explore categories"
        >
          {(
            [
              "scales",
              "modes",
              "chords",
              "triads",
              "arpeggios",
            ] as ExplorerMode[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleExplorerModeChange(item)}
              aria-pressed={mode === item}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold capitalize",
                mode === item
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              )}
            >
              {t(item)}
            </button>
          ))}
        </section>

        <section className="space-y-3" aria-label="Explore controls">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 font-mono text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
              {t("rootKey")}
            </span>
            {CHROMATIC.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRoot(key)}
                aria-pressed={root === key}
                className={cn(
                  "min-w-12 rounded-lg border px-3 py-2 font-mono text-xs font-semibold",
                  root === key
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border-[var(--border-2)] bg-[var(--card)] hover:bg-[var(--secondary)]"
                )}
              >
                {getKeyLabel(key)}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 font-mono text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
              {t("tuning")}
              <select
                value={tuningId}
                onChange={(event) => setTuningId(event.target.value)}
                className="rounded-lg border border-[var(--border-2)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
              >
                {TUNINGS.map((tuning) => (
                  <option key={tuning.id} value={tuning.id}>
                    {tuning.strings.join(" ")} · {tuning.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 font-mono text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
              {isScaleExplorer ? t("scale") : t("chord")}
            </span>
            {isScaleExplorer
              ? (mode === "modes" ? MODES : SCALES).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScaleId(item.id)}
                    aria-pressed={scaleId === item.id}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      scaleId === item.id
                        ? "border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]"
                        : "border-[var(--border-2)] bg-[var(--card)] hover:bg-[var(--secondary)]"
                    )}
                  >
                    {scaleLabel(locale, item.id, item.name)}
                  </button>
                ))
              : (mode === "triads" ? TRIAD_CHORD_TYPES : CHORDS).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      mode === "arpeggios"
                        ? setArpeggioChordId(item.id)
                        : mode === "triads"
                          ? setTriadId(item.id)
                          : setChordId(item.id)
                    }
                    aria-pressed={
                      (mode === "arpeggios"
                        ? arpeggioChordId
                        : mode === "triads"
                          ? triadId
                          : chordId) === item.id
                    }
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm",
                      (mode === "arpeggios"
                        ? arpeggioChordId
                        : mode === "triads"
                          ? triadId
                          : chordId) === item.id
                        ? "border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]"
                        : "border-[var(--border-2)] bg-[var(--card)] hover:bg-[var(--secondary)]"
                    )}
                  >
                    {chordLabel(locale, item.id, item.name)}
                  </button>
                ))}
            {mode === "scales" &&
            (scaleId === "pentatonic_major" ||
              scaleId === "pentatonic_minor") ? (
              <button
                type="button"
                onClick={() => setGuidedRoutesOpen(true)}
                className="rounded-full border border-[var(--border-2)] px-4 py-2 text-sm"
              >
                {routeText(locale, "title")}
              </button>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
                {t("displayMode")}
              </span>
              <DisplayOptions value={displayMode} onChange={setDisplayMode} />
            </div>
          </div>
        </section>

        {isChordExplorer ? (
          <section
            aria-label={locale === "th" ? "คอร์ดไดอะโทนิก" : "Diatonic chords"}
            className="space-y-3 rounded-xl border border-[var(--border-2)] bg-[var(--card)] p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="mr-auto">
                <h2 className="text-sm font-semibold">
                  {locale === "th" ? "ไดอะโทนิก" : "Diatonic"}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {locale === "th"
                    ? "เลือกขั้นเพื่อแสดงบนเฟรตบอร์ด"
                    : "Select a degree to explore it on the fretboard"}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold">
                {locale === "th" ? "คีย์เมเจอร์" : "Major key"}
                <select
                  value={diatonicKey}
                  onChange={(event) =>
                    setDiatonicKey(event.target.value as NoteName)
                  }
                  className="rounded-lg border border-[var(--border-2)] bg-[var(--card)] px-3 py-2 text-xs"
                >
                  {CHROMATIC.map((key) => (
                    <option key={key} value={key}>
                      {getKeyLabel(key)}
                    </option>
                  ))}
                </select>
              </label>
              {mode === "chords" ? (
                <div
                  className="flex gap-1"
                  aria-label={
                    locale === "th"
                      ? "ประเภทคอร์ดไดอะโทนิก"
                      : "Diatonic chord type"
                  }
                >
                  {(["triad", "seventh"] as const).map((kind) => (
                    <Button
                      key={kind}
                      type="button"
                      size="sm"
                      variant={diatonicKind === kind ? "default" : "outline"}
                      aria-pressed={diatonicKind === kind}
                      onClick={() => setDiatonicKind(kind)}
                    >
                      {kind === "triad" ? t("triads") : "7th"}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {diatonicChords.map((chord) => (
                <Button
                  key={chord.degree}
                  type="button"
                  variant="outline"
                  aria-pressed={
                    root === chord.root &&
                    (mode === "triads" ? triadId : chordId) === chord.chordId
                  }
                  onClick={() => {
                    const isTriad = mode === "triads"
                    const nextVoicings = selectedTuning
                      ? (isTriad ? getTriadVoicings : getChordVoicings)(
                          chord.root,
                          chord.chordId,
                          selectedTuning
                        )
                      : []
                    const nextId = findNearestVoicing(
                      nextVoicings,
                      isTriad ? selectedTriadVoicing : baseSelectedVoicing
                    )?.id
                    const currentId = isTriad ? triadId : chordId
                    if (root !== chord.root || currentId !== chord.chordId) {
                      pendingDiatonicVoicing.current = {
                        mode: isTriad ? "triads" : "chords",
                        id: nextId,
                      }
                    } else if (isTriad) {
                      setSelectedTriadVoicingId(nextId)
                    } else {
                      setSelectedVoicingId(nextId)
                    }
                    setRoot(chord.root)
                    if (mode === "triads") setTriadId(chord.chordId)
                    else setChordId(chord.chordId)
                  }}
                  className={cn(
                    "h-auto flex-col items-start gap-1 px-3 py-2",
                    root === chord.root &&
                      (mode === "triads" ? triadId : chordId) ===
                        chord.chordId &&
                      "border-[var(--accent)] bg-[var(--secondary)]"
                  )}
                >
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {chord.romanNumeral}
                  </span>
                  <span className="text-sm font-semibold">
                    {spellNoteInKey(diatonicKey, chord.root)}
                    {getChordById(chord.chordId)?.symbol ?? ""}
                  </span>
                </Button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-[var(--border-2)] bg-[var(--card)] shadow-sm">
          <div className="flex h-[min(49vh,500px)] min-h-[340px] items-center px-3 sm:px-5">
            <FretboardPanel
              root={root}
              pattern={selectedPattern}
              tuningId={tuningId}
              focusRange={focusRange}
              colorPreset={colorPreset}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              rootOnly={rootOnly}
              selectedVoicing={isChordExplorer ? activeVoicing : undefined}
              shapeFocus={
                mode === "triads" ||
                (isChordExplorer && activeChordDisplayMode === "shapeFocus")
              }
              arpeggio={mode === "arpeggios" ? resolvedArpeggio : undefined}
            />
          </div>
          <Legend
            activeIntervals={
              isChordExplorer
                ? (selectedChordPattern?.intervals ?? [])
                : mode === "arpeggios"
                  ? (selectedArpeggioChord?.intervals ?? [])
                  : undefined
            }
          />
        </section>
        {isScaleExplorer ? (
          <PositionTabs
            value={position}
            onChange={handlePositionChange}
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
          />
        ) : mode === "arpeggios" ? (
          <ArpeggioControls
            voicings={arpeggioVoicings}
            value={selectedArpeggioVoicingId}
            onChange={setSelectedArpeggioVoicingId}
            direction={arpeggioDirection}
            onDirectionChange={setArpeggioDirection}
          />
        ) : (
          <ChordVoicingSelector
            voicings={mode === "triads" ? triadVoicings : chordVoicings}
            value={
              mode === "triads" ? selectedTriadVoicingId : selectedVoicingId
            }
            onChange={
              mode === "triads"
                ? setSelectedTriadVoicingId
                : setSelectedVoicingId
            }
            displayMode={activeChordDisplayMode}
            onDisplayModeChange={
              mode === "triads" ? setTriadDisplayMode : setChordDisplayMode
            }
            tuningStrings={selectedTuning?.strings ?? []}
            voicing={selectedVoicingForControls}
            onToggleMutedString={toggleMutedString}
            fixedShape={mode === "triads"}
            label={mode === "triads" ? t("triads") : undefined}
          />
        )}
        {isScaleExplorer ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <RelatedScales root={root} scaleId={scaleId} />
          </div>
        ) : null}
      </main>
      {isScaleExplorer ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3 sm:px-8">
          <div className="mx-auto flex max-w-[1680px] items-center gap-3">
            <Playback
              root={root}
              scaleId={scaleId}
              tuningId={tuningId}
              compact
            />
            <span className="ml-auto hidden text-xs text-[var(--muted-foreground)] sm:block">
              Tap any note to hear it
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
