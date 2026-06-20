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
import type { ColorPreset } from "@/types/fretboard"
import type { NoteName } from "@/types/music"
import { useState } from "react"

export default function FretFlowPage() {
  const [root, setRoot] = useState<NoteName>("C")
  const [scaleId, setScaleId] = useState("major")
  const [tuningId, setTuningId] = useState("standard")
  const [colorPreset, setColorPreset] = useState<ColorPreset>("minimal")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("notes")
  const [position, setPosition] = useState<PositionId>("full")

  const showNoteNames = displayMode === "notes"
  const showIntervals = displayMode === "degrees"
  const rootOnly = displayMode === "rootOnly"
  const fretRange = POSITION_RANGES[position]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: "200px 1fr 220px",
          height: "calc(100vh - 49px)",
        }}
      >
        <aside
          className="flex flex-col overflow-y-auto"
          style={{
            backgroundColor: "var(--surface)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <KeySelector value={root} onChange={setRoot} />
          <ScaleTypeSelector value={scaleId} onChange={setScaleId} />
          <TuningSelector value={tuningId} onChange={setTuningId} />
        </aside>

        <main
          className="flex flex-col overflow-hidden"
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

        <aside
          className="flex flex-col overflow-y-auto"
          style={{
            backgroundColor: "var(--surface)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <IntervalList root={root} scaleId={scaleId} />
          <StatsGrid scaleId={scaleId} />
          <RelatedScales root={root} scaleId={scaleId} />
          <Playback root={root} scaleId={scaleId} />
        </aside>
      </div>
    </div>
  )
}
