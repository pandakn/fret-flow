"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SCALES } from "@/lib/scales";

interface ScaleTypeSelectorProps {
  value: string;
  onChange: (scaleId: string) => void;
}

export function ScaleTypeSelector({ value, onChange }: ScaleTypeSelectorProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Scale Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {SCALES.map((scale) => (
          <button
            key={scale.id}
            onClick={() => onChange(scale.id)}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all",
              value === scale.id
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {scale.name}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
