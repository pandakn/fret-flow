"use client";

import { cn } from "@/lib/utils";
import { AVAILABLE_SCALES } from "./hooks/useControls";

interface ScaleSelectorProps {
  value: string;
  onChange: (scaleId: string) => void;
  className?: string;
}

export function ScaleSelector({ value, onChange, className }: ScaleSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-foreground">Scale</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {AVAILABLE_SCALES.map((scale) => (
          <option key={scale.id} value={scale.id}>
            {scale.name}
          </option>
        ))}
      </select>
    </div>
  );
}
