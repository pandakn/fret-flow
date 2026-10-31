"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CUSTOM_PROGRESSION_BAR_OPTIONS,
  CUSTOM_PROGRESSION_DEGREES,
  CHORD_TONE_IDS,
  type ChordToneId,
  type CustomProgressionBars,
  type CustomProgression,
  type CustomProgressionOffset,
} from "@/lib/progressions/catalog"
import type {
  CustomProgressionDraft,
  CustomProgressionStepDraft,
} from "@/lib/progressions/custom"
import type { MessageKey } from "@/lib/i18n/messages"
import { cn } from "@/lib/utils"

const CHORD_QUALITY_LABELS: Record<ChordToneId, MessageKey> = {
  maj: "majorTriad",
  maj6: "majorSixth",
  m: "minorTriad",
  "7": "dominantSeventh",
  m7: "minorSeventh",
  maj7: "majorSeventh",
  dom9: "dominantNinth",
  m9: "minorNinth",
  maj9: "majorNinth",
}

const DEFAULT_STEP: CustomProgressionStepDraft = {
  offset: 0,
  toneId: "maj",
  bars: 1,
}

const parseOffset = (value: string): CustomProgressionOffset | null => {
  const option = CUSTOM_PROGRESSION_DEGREES.find(
    (item) => String(item.offset) === value
  )
  return option?.offset ?? null
}

const parseToneId = (value: string): ChordToneId | null =>
  CHORD_TONE_IDS.find((id) => id === value) ?? null

const parseBars = (value: string): CustomProgressionBars | null => {
  const option = CUSTOM_PROGRESSION_BAR_OPTIONS.find(
    (bars) => String(bars) === value
  )
  return option ?? null
}

export function CustomProgressionEditor({
  progression,
  onSave,
  onCancel,
}: {
  progression?: CustomProgression
  onSave: (draft: CustomProgressionDraft) => void
  onCancel: () => void
}) {
  const { t } = useI18n()
  const [name, setName] = useState(progression?.name ?? "")
  const [steps, setSteps] = useState<CustomProgressionStepDraft[]>(() =>
    progression
      ? progression.steps.map(({ offset, toneId, bars }) => ({
          offset,
          toneId,
          bars,
        }))
      : [DEFAULT_STEP]
  )

  const updateStep = (
    index: number,
    patch: Partial<CustomProgressionStepDraft>
  ) => {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step
      )
    )
  }

  const save = () => {
    const trimmedName = name.trim()
    if (trimmedName.length === 0 || steps.length === 0) return
    onSave({ name: trimmedName, steps })
  }

  return (
    <section
      aria-labelledby="custom-progression-editor-title"
      className="space-y-5 rounded-xl border border-[var(--border-2)] bg-[var(--surface)] p-4 sm:p-6"
    >
      <div>
        <h3
          id="custom-progression-editor-title"
          className="text-xl font-semibold tracking-tight"
        >
          {t(progression ? "editProgression" : "createProgression")}
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          {t("customProgressionHint")}
        </p>
      </div>

      <div className="max-w-md">
        <label
          htmlFor="custom-progression-name"
          className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
        >
          {t("progressionName")}
        </label>
        <Input
          id="custom-progression-name"
          value={name}
          maxLength={40}
          placeholder={t("progressionNamePlaceholder")}
          onChange={(event) => setName(event.target.value)}
          className="rounded-md border-[var(--border-2)] bg-[var(--surface2)]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-mono text-xs tracking-[0.14em] text-[var(--muted-foreground)] uppercase">
            {t("chordSequence")}
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={steps.length >= 12}
            onClick={() => setSteps((current) => [...current, DEFAULT_STEP])}
          >
            <Plus aria-hidden="true" />
            {t("addChord")}
          </Button>
        </div>

        <ol className="space-y-2">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--border-2)] p-3"
            >
              <div className="min-w-24 flex-1">
                <label
                  htmlFor={`custom-chord-degree-${index}`}
                  className="mb-1.5 block text-xs text-[var(--muted-foreground)]"
                >
                  {t("degree")}
                </label>
                <Select
                  value={String(step.offset)}
                  onValueChange={(value) => {
                    const offset = parseOffset(value)
                    if (offset !== null) updateStep(index, { offset })
                  }}
                >
                  <SelectTrigger
                    id={`custom-chord-degree-${index}`}
                    className="w-full rounded-md border-[var(--border-2)] bg-[var(--surface2)]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_PROGRESSION_DEGREES.map((option) => (
                      <SelectItem
                        key={option.offset}
                        value={String(option.offset)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-36 flex-[2]">
                <label
                  htmlFor={`custom-chord-quality-${index}`}
                  className="mb-1.5 block text-xs text-[var(--muted-foreground)]"
                >
                  {t("chordQuality")}
                </label>
                <Select
                  value={step.toneId}
                  onValueChange={(value) => {
                    const toneId = parseToneId(value)
                    if (toneId) updateStep(index, { toneId })
                  }}
                >
                  <SelectTrigger
                    id={`custom-chord-quality-${index}`}
                    className="w-full rounded-md border-[var(--border-2)] bg-[var(--surface2)]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHORD_TONE_IDS.map((toneId) => (
                      <SelectItem key={toneId} value={toneId}>
                        {t(CHORD_QUALITY_LABELS[toneId])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24">
                <label
                  htmlFor={`custom-chord-bars-${index}`}
                  className="mb-1.5 block text-xs text-[var(--muted-foreground)]"
                >
                  {t("bars")}
                </label>
                <Select
                  value={String(step.bars)}
                  onValueChange={(value) => {
                    const bars = parseBars(value)
                    if (bars !== null) updateStep(index, { bars })
                  }}
                >
                  <SelectTrigger
                    id={`custom-chord-bars-${index}`}
                    className="w-full rounded-md border-[var(--border-2)] bg-[var(--surface2)]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_PROGRESSION_BAR_OPTIONS.map((bars) => (
                      <SelectItem key={bars} value={String(bars)}>
                        {bars}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={steps.length === 1}
                aria-label={`${t("removeChord")} ${index + 1}`}
                title={`${t("removeChord")} ${index + 1}`}
                onClick={() =>
                  setSteps((current) =>
                    current.filter((_, stepIndex) => stepIndex !== index)
                  )
                }
                className={cn(
                  "text-[var(--muted-foreground)] hover:text-destructive"
                )}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="button"
          disabled={name.trim().length === 0 || steps.length === 0}
          onClick={save}
        >
          {t("saveProgression")}
        </Button>
      </div>
    </section>
  )
}
