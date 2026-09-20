"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDefaultExercise } from "@/lib/practice/exercises"
import { cn } from "@/lib/utils"
import type { FretboardRecallExercise } from "@/types/practice"

export function FretboardRecallSetup({
  onBack,
  onStart,
}: {
  onBack: () => void
  onStart: (exercise: FretboardRecallExercise) => void
}) {
  const [initial] = useState(() => createDefaultExercise("fretboardRecall"))
  if (initial.kind !== "fretboardRecall") throw new Error("Expected fretboard exercise")
  const [recall, setRecall] = useState<FretboardRecallExercise["recall"]>(initial.recall)
  const [maxFret, setMaxFret] = useState(12)
  const [strings, setStrings] = useState(initial.strings)
  const toggleString = (string: number) => {
    setStrings((current) =>
      current.includes(string)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== string)
        : [...current, string].toSorted()
    )
  }

  return (
    <Card className="mx-auto max-w-2xl border-[var(--border-2)] shadow-none">
      <CardHeader>
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">Drill setup</p>
        <CardTitle className="text-3xl">Fretboard recall</CardTitle>
      </CardHeader>
      <CardContent className="space-y-7">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">What do you want to recall?</legend>
          <div className="grid grid-cols-3 gap-2">
            {(["note", "root", "interval"] as const).map((option) => (
              <Button key={option} type="button" variant={recall === option ? "default" : "outline"} onClick={() => setRecall(option)} className="capitalize">{option}</Button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="fret-range" className="mb-3 block text-sm font-medium">Fret range</label>
          <Select value={String(maxFret)} onValueChange={(value) => setMaxFret(Number(value))}>
            <SelectTrigger id="fret-range" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{[5, 7, 9, 12, 15].map((fret) => <SelectItem key={fret} value={String(fret)}>Frets 0–{fret}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Strings</legend>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <button key={index} type="button" aria-pressed={strings.includes(index)} onClick={() => toggleString(index)} className={cn("aspect-square rounded-full border font-mono text-sm transition-colors", strings.includes(index) ? "border-foreground bg-foreground text-background" : "border-[var(--border-2)] text-muted-foreground hover:border-foreground")}>{index + 1}</button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">String 1 is the low E string.</p>
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button onClick={() => onStart({ ...initial, recall, strings, fretRange: { min: 0, max: maxFret }, name: `${recall[0].toUpperCase()}${recall.slice(1)} recall` })}>Start drill</Button>
        </div>
      </CardContent>
    </Card>
  )
}
