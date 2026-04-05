"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
            <Button
              key={key}
              onClick={() => onChange(key)}
              variant={value === key ? "default" : "outline"}
              className={cn(
                "h-10 transition-all",
                value === key
                  ? "bg-purple-500 text-white shadow-md hover:bg-purple-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {key}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
