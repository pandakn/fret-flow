"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Legend() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-xs text-gray-700">Root (R)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-700">Major 2nd (2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-violet-500" />
            <span className="text-xs text-gray-700">Minor 2nd (b2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-violet-500" />
            <span className="text-xs text-gray-700">Minor 3rd (b3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-xs text-gray-700">Major 3rd (3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-xs text-gray-700">Perfect 4th (4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-700">Diminished 5th (b5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-xs text-gray-700">Perfect 5th (5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-500" />
            <span className="text-xs text-gray-700">Minor 6th (b6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-500" />
            <span className="text-xs text-gray-700">Major 6th (6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500" />
            <span className="text-xs text-gray-700">Minor 7th (b7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-700">Major 7th (7)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
