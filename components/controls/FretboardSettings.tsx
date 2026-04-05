"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ColorPreset } from "@/types/fretboard"
import { FRETBOARD_PRESETS } from "@/types/fretboard"
import { cn } from "@/lib/utils"

interface FretboardSettingsProps {
  colorPreset: ColorPreset
  fretCount: number
  tuningId: string
  onColorPresetChange: (preset: ColorPreset) => void
  onFretCountChange: (count: number) => void
  onTuningChange: (tuningId: string) => void
}

export function FretboardSettings({
  colorPreset,
  fretCount,
  tuningId,
  onColorPresetChange,
  onFretCountChange,
  onTuningChange,
}: FretboardSettingsProps) {
  const handleFretCountChange = (value: number[]) => {
    onFretCountChange(value[0])
  }

  const getPresetGradient = (preset: ColorPreset) => {
    const gradients: Record<ColorPreset, string> = {
      natural: "from-amber-700 to-amber-900",
      light: "from-amber-100 to-amber-200",
      dark: "from-amber-800 to-amber-950",
      blue: "from-blue-700 to-blue-900",
      purple: "from-purple-700 to-purple-900",
      green: "from-green-700 to-green-900",
      red: "from-red-700 to-red-900",
    }
    return gradients[preset]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fretboard Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Preset Selection */}
        <div className="space-y-3">
          <Label htmlFor="color-preset">Color Preset</Label>
          <div className="grid grid-cols-2 gap-2">
            {FRETBOARD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onColorPresetChange(preset.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-[1.02]",
                  colorPreset === preset.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-md shadow-inner",
                    "bg-gradient-to-br",
                    getPresetGradient(preset.id)
                  )}
                />
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">
                    {preset.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {preset.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fret Count Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="fret-count">Fret Count</Label>
            <span className="text-sm text-muted-foreground">
              {fretCount} frets
            </span>
          </div>
          <Slider
            id="fret-count"
            min={12}
            max={24}
            step={3}
            value={[fretCount]}
            onValueChange={handleFretCountChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12</span>
            <span>15</span>
            <span>18</span>
            <span>21</span>
            <span>24</span>
          </div>
        </div>

        {/* Tuning Selection */}
        <div className="space-y-2">
          <Label htmlFor="tuning-select">Tuning</Label>
          <Select value={tuningId} onValueChange={onTuningChange}>
            <SelectTrigger id="tuning-select">
              <SelectValue placeholder="Select tuning" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (E A D G B E)</SelectItem>
              <SelectItem value="drop_d">Drop D (D A D G B E)</SelectItem>
              <SelectItem value="half_step_down">
                Half Step Down (Eb Ab Db Gb Bb Eb)
              </SelectItem>
              <SelectItem value="open_d">Open D (D A D F# A D)</SelectItem>
              <SelectItem value="open_g">Open G (D G D G B D)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
