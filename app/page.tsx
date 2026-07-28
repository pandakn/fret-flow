"use client"

import { KeySelector } from "@/components/controls/KeySelector"
import { ChordTypeSelector } from "@/components/controls/ChordTypeSelector"
import { ScaleTypeSelector } from "@/components/controls/ScaleTypeSelector"
import { TuningSelector } from "@/components/controls/TuningSelector"
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
import { ScaleInfo } from "@/components/layout/ScaleInfo"
import { ModeInfo } from "@/components/layout/ModeInfo"
import { IntervalList } from "@/components/layout/IntervalList"
import { StatsGrid } from "@/components/layout/StatsGrid"
import { RelatedScales } from "@/components/layout/RelatedScales"
import { Playback } from "@/components/layout/Playback"
import { ArpeggioPlayback } from "@/components/layout/ArpeggioPlayback"
import { CollapsiblePanel } from "@/components/layout/CollapsiblePanel"
import { ChordInfo } from "@/components/layout/ChordInfo"
import { ArpeggioInfo } from "@/components/layout/ArpeggioInfo"
import { ArpeggioControls } from "@/components/layout/ArpeggioControls"
import { ArpeggioSequence } from "@/components/layout/ArpeggioSequence"
import { ChordToneList } from "@/components/layout/ChordToneList"
import {
  ChordVoicingSelector,
  type ChordDisplayMode,
} from "@/components/layout/ChordVoicingSelector"
import { ChordVoicingSummary } from "@/components/layout/ChordVoicingSummary"
import { getChordVoicings } from "@/lib/chord-voicings"
import { getChordById } from "@/lib/chords"
import { resolveArpeggio, type ArpeggioDirection } from "@/lib/arpeggios"
import { getModeById, getScaleById, MODES } from "@/lib/scales"
import { getTuningById } from "@/lib/tunings"
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { useEffect, useMemo, useState } from "react"

export default function FretFlowPage() {
  const [root, setRoot] = useState<NoteName>("C")
  const [mode, setMode] = useState<ExplorerMode>("scales")
  const [scaleId, setScaleId] = useState("major")
  const [chordId, setChordId] = useState("major")
  const [selectedVoicingId, setSelectedVoicingId] = useState<string>()
  const [chordDisplayMode, setChordDisplayMode] =
    useState<ChordDisplayMode>("toneMap")
  const [arpeggioChordId, setArpeggioChordId] = useState("major")
  const [selectedArpeggioVoicingId, setSelectedArpeggioVoicingId] =
    useState<string>()
  const [arpeggioDirection, setArpeggioDirection] =
    useState<ArpeggioDirection>("ascending")
  const [tuningId, setTuningId] = useState("standard")
  const [colorPreset, setColorPreset] = useState<ColorPreset>("minimal")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("notes")
  const [position, setPosition] = useState<PositionId>("full")
  const [focusMode, setFocusMode] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [modifier, setModifier] = useState("Ctrl")

  useEffect(() => {
    // ⌘ on macOS/iOS, Ctrl elsewhere — matches Zed's display convention.
    // Platform is only known client-side, so this avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModifier(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl")

    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return
      const k = e.key.toLowerCase()
      if (k === "b") {
        e.preventDefault()
        setLeftOpen((o) => !o)
      } else if (k === "r") {
        e.preventDefault()
        setRightOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const showNoteNames = displayMode === "notes"
  const showIntervals = displayMode === "degrees"
  const rootOnly = displayMode === "rootOnly"
  const isScaleExplorer = mode === "scales" || mode === "modes"
  const focusRange =
    isScaleExplorer && focusMode ? POSITION_RANGES[position] : undefined
  const selectedScale = getScaleById(scaleId)
  const selectedChord = getChordById(chordId)
  const selectedArpeggioChord = getChordById(arpeggioChordId)
  const selectedTuning = getTuningById(tuningId)
  const chordVoicings = useMemo(
    () =>
      selectedTuning ? getChordVoicings(root, chordId, selectedTuning) : [],
    [chordId, root, selectedTuning]
  )
  const selectedVoicing = chordVoicings.find(
    (voicing) => voicing.id === selectedVoicingId
  )
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
  const selectedPattern = isScaleExplorer
    ? selectedScale
    : mode === "arpeggios"
      ? selectedArpeggioChord
      : selectedChord

  useEffect(() => {
    // Root, chord, and tuning define the playable set, so always select its
    // first valid entry rather than retaining a possibly stale template ID.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVoicingId(chordVoicings[0]?.id)
  }, [chordId, chordVoicings, root, tuningId])

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar mode={mode} onModeChange={handleExplorerModeChange} />

      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 49px)" }}
      >
        <CollapsiblePanel
          side="left"
          open={leftOpen}
          onOpenChange={setLeftOpen}
          width={200}
          shortcutKey="b"
          modifier={modifier}
          style={{
            backgroundColor: "var(--surface)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <KeySelector value={root} onChange={setRoot} />
          {isScaleExplorer ? (
            <ScaleTypeSelector
              value={scaleId}
              onChange={setScaleId}
              scales={mode === "modes" ? MODES : undefined}
              label={mode === "modes" ? "Mode" : undefined}
            />
          ) : (
            <ChordTypeSelector
              value={mode === "arpeggios" ? arpeggioChordId : chordId}
              onChange={mode === "arpeggios" ? setArpeggioChordId : setChordId}
            />
          )}
          <TuningSelector value={tuningId} onChange={setTuningId} />
        </CollapsiblePanel>

        <main
          className="flex min-w-0 flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: "var(--surface)" }}
        >
          {mode === "scales" ? (
            <ScaleInfo
              root={root}
              scaleId={scaleId}
              colorPreset={colorPreset}
              onColorPresetChange={setColorPreset}
            />
          ) : mode === "modes" ? (
            <ModeInfo
              root={root}
              modeId={scaleId}
              colorPreset={colorPreset}
              onColorPresetChange={setColorPreset}
            />
          ) : mode === "arpeggios" ? (
            <ArpeggioInfo
              root={root}
              chordId={arpeggioChordId}
              voicing={selectedArpeggioVoicing}
              colorPreset={colorPreset}
              onColorPresetChange={setColorPreset}
            />
          ) : (
            <ChordInfo
              root={root}
              chordId={chordId}
              colorPreset={colorPreset}
              onColorPresetChange={setColorPreset}
            />
          )}

          <div
            className="flex items-center"
            style={{
              borderBottom: "1px solid var(--border)",
              padding: "9px 32px",
            }}
          >
            <DisplayOptions value={displayMode} onChange={setDisplayMode} />
          </div>

          <FretboardPanel
            root={root}
            pattern={selectedPattern}
            tuningId={tuningId}
            focusRange={focusRange}
            colorPreset={colorPreset}
            showNoteNames={showNoteNames}
            showIntervals={showIntervals}
            rootOnly={rootOnly}
            selectedVoicing={mode === "chords" ? selectedVoicing : undefined}
            shapeFocus={mode === "chords" && chordDisplayMode === "shapeFocus"}
            arpeggio={mode === "arpeggios" ? resolvedArpeggio : undefined}
          />

          <Legend
            activeIntervals={
              mode === "chords"
                ? (selectedChord?.intervals ?? [])
                : mode === "arpeggios"
                  ? (selectedArpeggioChord?.intervals ?? [])
                  : undefined
            }
          />
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
              voicings={chordVoicings}
              value={selectedVoicingId}
              onChange={setSelectedVoicingId}
              displayMode={chordDisplayMode}
              onDisplayModeChange={setChordDisplayMode}
            />
          )}
        </main>

        <CollapsiblePanel
          side="right"
          open={rightOpen}
          onOpenChange={setRightOpen}
          width={220}
          shortcutKey="r"
          modifier={modifier}
          style={{
            backgroundColor: "var(--surface)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          {isScaleExplorer ? (
            <>
              <IntervalList root={root} scaleId={scaleId} />
              <StatsGrid scaleId={scaleId} />
              <RelatedScales root={root} scaleId={scaleId} />
              <Playback root={root} scaleId={scaleId} />
            </>
          ) : mode === "arpeggios" ? (
            <>
              <ChordToneList root={root} chordId={arpeggioChordId} />
              <ChordVoicingSummary voicing={selectedArpeggioVoicing} />
              <ArpeggioSequence arpeggio={resolvedArpeggio} />
              <ArpeggioPlayback root={root} arpeggio={resolvedArpeggio} />
            </>
          ) : (
            <>
              <ChordToneList root={root} chordId={chordId} />
              <ChordVoicingSummary voicing={selectedVoicing} />
            </>
          )}
        </CollapsiblePanel>
      </div>
    </div>
  )
}
