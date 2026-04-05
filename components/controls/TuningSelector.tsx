"use client";

import { cn } from "@/lib/utils";
import { AVAILABLE_TUNINGS } from "./hooks/useControls";

interface TuningSelectorProps {
  value: string;
  onChange: (tuningId: string) => void;
  className?: string;
}

export function TuningSelector({ value, onChange, className }: TuningSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-foreground">Tuning</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {AVAILABLE_TUNINGS.map((tuning) => (
          <option key={tuning.id} value={tuning.id}>
            {tuning.name}
          </option>
        ))}
      </select>
    </div>
  );
}
