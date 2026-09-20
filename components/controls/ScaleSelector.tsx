"use client"

import { cn } from "@/lib/utils"
import { AVAILABLE_SCALES } from "./hooks/useControls"

interface ScaleSelectorProps {
  value: string
  onChange: (scaleId: string) => void
  className?: string
}

export function ScaleSelector({
  value,
  onChange,
  className,
}: ScaleSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-foreground">Scale</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
      >
        {AVAILABLE_SCALES.map((scale) => (
          <option key={scale.id} value={scale.id}>
            {scale.name}
          </option>
        ))}
      </select>
    </div>
  )
}
