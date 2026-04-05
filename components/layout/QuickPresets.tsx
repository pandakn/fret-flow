"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NoteName } from "@/types/music";

interface Preset {
  key: NoteName;
  scaleId: string;
  label: string;
}

interface QuickPresetsProps {
  presets: Preset[];
  selectedRoot: NoteName;
  selectedScaleId: string;
  onSelect: (root: NoteName, scaleId: string) => void;
}

export function QuickPresets({ presets, selectedRoot, selectedScaleId, onSelect }: QuickPresetsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Quick Presets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSelect(preset.key, preset.scaleId)}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all",
              selectedRoot === preset.key && selectedScaleId === preset.scaleId
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700"
            )}
          >
            {preset.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
