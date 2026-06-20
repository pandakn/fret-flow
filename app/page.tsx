"use client"

import { KeySelector } from "@/components/controls/KeySelector"
import { ScaleTypeSelector } from "@/components/controls/ScaleTypeSelector"
import { TuningSelector } from "@/components/controls/TuningSelector"
import {
  DisplayOptions,
  type DisplayMode,
} from "@/components/controls/DisplayOptions"
import { FretboardPanel } from "@/components/layout/FretboardPanel"
import { Legend } from "@/components/layout/Legend"
import { Navbar } from "@/components/layout/Navbar"
import {
  PositionTabs,
  POSITION_RANGES,
  type PositionId,
} from "@/components/layout/PositionTabs"
import { ScaleInfo } from "@/components/layout/ScaleInfo"
import { IntervalList } from "@/components/layout/IntervalList"
import { StatsGrid } from "@/components/layout/StatsGrid"
import { RelatedScales } from "@/components/layout/RelatedScales"
import { Playback } from "@/components/layout/Playback"
import { CollapsiblePanel } from "@/components/layout/CollapsiblePanel"
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { useEffect, useState } from "react"

export default function FretFlowPage() {
  const [root, setRoot] = useState<NoteName>("C")
  const [scaleId, setScaleId] = useState("major")
  const [tuningId, setTuningId] = useState("standard")
  const [colorPreset, setColorPreset] = useState<ColorPreset>("minimal")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("notes")
  const [position, setPosition] = useState<PositionId>("full")
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
  const fretRange = POSITION_RANGES[position]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

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
          <ScaleTypeSelector value={scaleId} onChange={setScaleId} />
          <TuningSelector value={tuningId} onChange={setTuningId} />
        </CollapsiblePanel>

        <main
          className="flex min-w-0 flex-1 flex-col overflow-hidden"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <ScaleInfo
            root={root}
            scaleId={scaleId}
            colorPreset={colorPreset}
            onColorPresetChange={setColorPreset}
          />

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
            scaleId={scaleId}
            tuningId={tuningId}
            fretRange={fretRange}
            colorPreset={colorPreset}
            showNoteNames={showNoteNames}
            showIntervals={showIntervals}
            rootOnly={rootOnly}
          />

          <Legend />
          <PositionTabs value={position} onChange={setPosition} />
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
          <IntervalList root={root} scaleId={scaleId} />
          <StatsGrid scaleId={scaleId} />
          <RelatedScales root={root} scaleId={scaleId} />
          <Playback root={root} scaleId={scaleId} />
        </CollapsiblePanel>
      </div>
    </div>
  )
}
