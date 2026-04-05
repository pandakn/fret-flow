"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DisplayOptionsProps {
  showNoteNames: boolean;
  showIntervals: boolean;
  onShowNoteNamesChange: (show: boolean) => void;
  onShowIntervalsChange: (show: boolean) => void;
}

export function DisplayOptions({
  showNoteNames,
  showIntervals,
  onShowNoteNamesChange,
  onShowIntervalsChange,
}: DisplayOptionsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Display Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-notes" className="text-sm text-gray-700">
            Show Note Names
          </Label>
          <Switch
            id="show-notes"
            checked={showNoteNames}
            onCheckedChange={onShowNoteNamesChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-intervals" className="text-sm text-gray-700">
            Show Intervals
          </Label>
          <Switch
            id="show-intervals"
            checked={showIntervals}
            onCheckedChange={onShowIntervalsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
