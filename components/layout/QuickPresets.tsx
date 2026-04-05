"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const isSelected = (preset: Preset) => selectedRoot === preset.key && selectedScaleId === preset.scaleId;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Quick Presets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            onClick={() => onSelect(preset.key, preset.scaleId)}
            variant={isSelected(preset) ? "default" : "outline"}
            className={cn(
              "w-full justify-start transition-all",
              isSelected(preset)
                ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
