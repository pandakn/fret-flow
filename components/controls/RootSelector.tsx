"use client";

import { cn } from "@/lib/utils";
import { KEYS } from "./hooks/useControls";
import type { NoteName } from "@/types/music";

interface RootSelectorProps {
  value: NoteName;
  onChange: (root: NoteName) => void;
  className?: string;
}

export function RootSelector({ value, onChange, className }: RootSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-foreground">Root Note</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NoteName)}
        className="px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}
