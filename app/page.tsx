"use client"

import { useState } from "react"
import type { NoteName } from "@/types/music"
import type { ColorPreset } from "@/types/fretboard"
import { FretboardPanel } from "@/components/layout/FretboardPanel"
import { DisplayOptions } from "@/components/controls/DisplayOptions"
import { FretboardSettings } from "@/components/controls/FretboardSettings"
import { ScaleInfo } from "@/components/layout/ScaleInfo"
import { QuickPresets } from "@/components/layout/QuickPresets"
import { Legend } from "@/components/layout/Legend"

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
  const [selectedTuningId, setSelectedTuningId] = useState("standard")
  const [colorPreset, setColorPreset] = useState<ColorPreset>("light")
  const [fretCount, setFretCount] = useState(15)
  const [showNoteNames, setShowNoteNames] = useState(true)
  const [showIntervals, setShowIntervals] = useState(false)

  const handlePresetSelect = (root: NoteName, scaleId: string) => {
    setSelectedRoot(root)
    setSelectedScaleId(scaleId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <section className="w-full">
            <FretboardPanel
              root={selectedRoot}
              scaleId={selectedScaleId}
              tuningId={selectedTuningId}
              fretCount={fretCount}
              colorPreset={colorPreset}
              showNoteNames={showNoteNames}
              showIntervals={showIntervals}
              onRootChange={setSelectedRoot}
              onScaleChange={setSelectedScaleId}
            />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <aside className="space-y-4">
              <QuickPresets
                presets={DEFAULT_PRESETS}
                selectedRoot={selectedRoot}
                selectedScaleId={selectedScaleId}
                onSelect={handlePresetSelect}
              />
            </aside>

            <aside className="space-y-4">
              <FretboardSettings
                colorPreset={colorPreset}
                fretCount={fretCount}
                tuningId={selectedTuningId}
                onColorPresetChange={setColorPreset}
                onFretCountChange={setFretCount}
                onTuningChange={setSelectedTuningId}
              />
              <DisplayOptions
                showNoteNames={showNoteNames}
                showIntervals={showIntervals}
                onShowNoteNamesChange={setShowNoteNames}
                onShowIntervalsChange={setShowIntervals}
              />
            </aside>

            <aside className="space-y-4">
              <ScaleInfo root={selectedRoot} scaleId={selectedScaleId} />
            </aside>

            <aside className="space-y-4">
              <Legend />
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
