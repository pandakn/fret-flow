"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createDefaultExercise } from "@/lib/practice/exercises"
import { cn } from "@/lib/utils"
import type { FretboardRecallExercise } from "@/types/practice"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { practiceCopy } from "@/lib/i18n/practice-messages"

export function FretboardRecallSetup({
  onBack,
  onStart,
}: {
  onBack: () => void
  onStart: (exercise: FretboardRecallExercise) => void
}) {
  const { locale } = useI18n()
  const [initial] = useState(() => createDefaultExercise("fretboardRecall"))
  if (initial.kind !== "fretboardRecall")
    throw new Error("Expected fretboard exercise")
  const [recall, setRecall] = useState<FretboardRecallExercise["recall"]>(
    initial.recall
  )
  const [promptDirection, setPromptDirection] = useState<
    FretboardRecallExercise["promptDirection"]
  >(initial.promptDirection)
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
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {practiceCopy(locale, "Drill setup")}
        </p>
        <CardTitle className="text-3xl">{practiceCopy(locale, "Fretboard recall")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-7">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            {practiceCopy(locale, "What do you want to recall?")}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(["note", "root", "interval"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={recall === option ? "default" : "outline"}
                onClick={() => setRecall(option)}
                className="capitalize"
              >
                {practiceCopy(locale, option)}
              </Button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">{practiceCopy(locale, "Prompt direction")}</legend>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["findPosition", "Find notes"],
                ["namePosition", "Name positions"],
                ["mixed", "Mixed"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={promptDirection === value ? "default" : "outline"}
                onClick={() => setPromptDirection(value)}
              >
                {practiceCopy(locale, label)}
              </Button>
            ))}
          </div>
        </fieldset>
        <div>
          <label
            htmlFor="fret-range"
            className="mb-3 block text-sm font-medium"
          >
            {practiceCopy(locale, "Fret range")}
          </label>
          <Select
            value={String(maxFret)}
            onValueChange={(value) => setMaxFret(Number(value))}
          >
            <SelectTrigger id="fret-range" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 7, 9, 12, 15].map((fret) => (
                <SelectItem key={fret} value={String(fret)}>
                  {practiceCopy(locale, "Frets 0–{fret}", { fret })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <fieldset>
          <legend className="mb-3 text-sm font-medium">{practiceCopy(locale, "Strings")}</legend>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={strings.includes(index)}
                onClick={() => toggleString(index)}
                className={cn(
                  "aspect-square rounded-full border font-mono text-sm transition-colors",
                  strings.includes(index)
                    ? "border-foreground bg-foreground text-background"
                    : "border-[var(--border-2)] text-muted-foreground hover:border-foreground"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {practiceCopy(locale, "String 1 is the low E string.")}
          </p>
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onBack}>
            {practiceCopy(locale, "Back")}
          </Button>
          <Button
            onClick={() =>
              onStart({
                ...initial,
                recall,
                promptDirection,
                strings,
                fretRange: { min: 0, max: maxFret },
                name: `${recall[0].toUpperCase()}${recall.slice(1)} recall`,
              })
            }
          >
            {practiceCopy(locale, "Start drill")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
