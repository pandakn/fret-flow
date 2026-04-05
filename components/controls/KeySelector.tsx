"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NoteName } from "@/types/music";

interface KeySelectorProps {
  value: NoteName;
  onChange: (key: NoteName) => void;
}

export function KeySelector({ value, onChange }: KeySelectorProps) {
  const KEYS: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Key</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "px-2 py-2 rounded-lg text-sm font-medium transition-all",
                value === key
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
