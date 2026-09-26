"use client"

import { cn } from "@/lib/utils"
import type { ColorPreset } from "@/types/fretboard"
import type { CSSProperties } from "react"
import { useI18n } from "@/components/i18n/LocaleProvider"

const THAI_PRESET_NAMES: Record<ColorPreset, string> = {
  minimal: "มินิมอล",
  natural: "ธรรมชาติ",
  light: "สว่าง",
  dark: "มืด",
  blue: "น้ำเงิน",
  purple: "ม่วง",
  green: "เขียว",
  red: "แดง",
}

const PRESET_PILLS: ColorPreset[] = [
  "minimal",
  "natural",
  "light",
  "dark",
  "blue",
  "purple",
  "green",
  "red",
]

const PRESET_COLOR: Record<ColorPreset, string> = {
  minimal: "#faf9f7",
  natural: "#8b5a2b",
  light: "#f5deb3",
  dark: "#3a2818",
  blue: "#1e3a5f",
  purple: "#4a3b69",
  green: "#2d5a3d",
  red: "#8b3a3a",
}

interface ColorPresetPickerProps {
  value: ColorPreset
  onChange: (preset: ColorPreset) => void
}

export function ColorPresetPicker({ value, onChange }: ColorPresetPickerProps) {
  const { locale, t } = useI18n()
  return (
    <div className="flex gap-1" role="group" aria-label={t("colorPreset")}>
      {PRESET_PILLS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          title={locale === "th" ? THAI_PRESET_NAMES[preset] : preset}
          className={cn(
            "h-4 w-4 rounded-full transition-all",
            value === preset && "ring-2 ring-offset-1"
          )}
          style={
            {
              backgroundColor: PRESET_COLOR[preset],
              border: "1px solid var(--border-2)",
              ["--tw-ring-color" as string]:
                value === preset ? "var(--accent)" : undefined,
              ["--tw-ring-offset-color" as string]:
                value === preset ? "var(--surface)" : undefined,
            } as CSSProperties
          }
          aria-label={`${t("colorPreset")}: ${locale === "th" ? THAI_PRESET_NAMES[preset] : preset}`}
          aria-pressed={value === preset}
        />
      ))}
    </div>
  )
}
