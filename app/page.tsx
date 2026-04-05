"use client"

import { useState } from "react"
import type { NoteName } from "@/types/music"
import { Navbar } from "@/components/layout/Navbar"
import { KeySelector } from "@/components/controls/KeySelector"
import { ScaleTypeSelector } from "@/components/controls/ScaleTypeSelector"
import { DisplayOptions } from "@/components/controls/DisplayOptions"
import { ScaleInfo } from "@/components/layout/ScaleInfo"
import { QuickPresets } from "@/components/layout/QuickPresets"
import { Legend } from "@/components/layout/Legend"
import { FretboardPanel } from "@/components/layout/FretboardPanel"

type Preset = {
  key: NoteName
  scaleId: string
  label: string
}

const DEFAULT_PRESETS: Preset[] = [
  { key: "C", scaleId: "major", label: "C Major" },
  { key: "A", scaleId: "pentatonic_minor", label: "A Minor Pentatonic" },
  { key: "G", scaleId: "major", label: "G Major" },
  { key: "E", scaleId: "blues", label: "E Blues" },
]

export default function FretFlowPage() {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>("C")
  const [selectedScaleId, setSelectedScaleId] = useState("major")
  const selectedTuningId = "standard"
  const [showNoteNames, setShowNoteNames] = useState(true)
  const [showIntervals, setShowIntervals] = useState(false)

  const handlePresetSelect = (root: NoteName, scaleId: string) => {
    setSelectedRoot(root)
    setSelectedScaleId(scaleId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-3">
            <KeySelector value={selectedRoot} onChange={setSelectedRoot} />
            <ScaleTypeSelector
              value={selectedScaleId}
              onChange={setSelectedScaleId}
            />
            <DisplayOptions
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              onShowNoteNamesChange={setShowNoteNames}
              onShowIntervalsChange={setShowIntervals}
            />
          </aside>

          <section className="lg:col-span-6">
            <FretboardPanel
              root={selectedRoot}
              scaleId={selectedScaleId}
              tuningId={selectedTuningId}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
            />
          </section>

          <aside className="space-y-4 lg:col-span-3">
            <ScaleInfo root={selectedRoot} scaleId={selectedScaleId} />
            <QuickPresets
              presets={DEFAULT_PRESETS}
              selectedRoot={selectedRoot}
              selectedScaleId={selectedScaleId}
              onSelect={handlePresetSelect}
            />
            <Legend />
          </aside>
        </div>
      </main>
    </div>
  )
}
