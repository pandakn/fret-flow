"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <Button
            key={scale.id}
            onClick={() => onChange(scale.id)}
            variant={value === scale.id ? "default" : "outline"}
            className={cn(
              "w-full justify-start transition-all",
              value === scale.id
                ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {scale.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
