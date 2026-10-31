import {
  getChordToneSpec,
  isChordToneId,
  CUSTOM_PROGRESSION_BAR_OPTIONS,
  CUSTOM_PROGRESSION_DEGREES,
  type ChordToneId,
  type CustomProgressionBars,
  type CustomProgressionOffset,
  type CustomProgressionStep,
  type CustomProgression,
} from "./catalog"

export type CustomProgressionStepDraft = Pick<
  CustomProgressionStep,
  "offset" | "toneId" | "bars"
>

export type CustomProgressionDraft = {
  name: string
  steps: readonly CustomProgressionStepDraft[]
}

export const CUSTOM_PROGRESSION_STORAGE_KEY = "fretflow.customProgressions.v1"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isCustomProgressionOffset = (
  value: unknown
): value is CustomProgressionOffset =>
  CUSTOM_PROGRESSION_DEGREES.some(({ offset }) => offset === value)

const isCustomProgressionBars = (
  value: unknown
): value is CustomProgressionBars =>
  CUSTOM_PROGRESSION_BAR_OPTIONS.some((bars) => bars === value)

const makeRomanNumeral = (offset: number, toneId: ChordToneId): string => {
  const degree = CUSTOM_PROGRESSION_DEGREES[offset].label
  const isMinor = toneId === "m" || toneId === "m7" || toneId === "m9"
  const numeral = isMinor
    ? degree.replace(/[IV]+$/, (letters) => letters.toLowerCase())
    : degree

  return `${numeral}${getChordToneSpec(toneId)?.quality ?? ""}`
}

const makeStep = (
  draft: CustomProgressionStepDraft
): CustomProgressionStep => ({
  ...draft,
  romanNumeral: makeRomanNumeral(draft.offset, draft.toneId),
})

export const createCustomProgression = ({
  id,
  name,
  steps,
}: {
  id: string
  name: string
  steps: readonly CustomProgressionStepDraft[]
}): CustomProgression => ({
  kind: "custom",
  id,
  name: name.trim(),
  steps: steps.map(makeStep),
})

const parseCustomProgression = (value: unknown): CustomProgression | null => {
  if (!isRecord(value)) return null

  const { id, name, steps } = value
  if (
    typeof id !== "string" ||
    !/^custom-[A-Za-z0-9-]+$/.test(id) ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 40 ||
    !Array.isArray(steps) ||
    steps.length === 0 ||
    steps.length > 12
  ) {
    return null
  }

  const parsedSteps: CustomProgressionStepDraft[] = []
  for (const step of steps) {
    if (!isRecord(step)) return null

    const { offset, toneId, bars } = step
    if (
      !isCustomProgressionOffset(offset) ||
      !isChordToneId(toneId) ||
      !isCustomProgressionBars(bars)
    ) {
      return null
    }

    parsedSteps.push({ offset, toneId, bars })
  }

  return createCustomProgression({ id, name, steps: parsedSteps })
}

export const parseCustomProgressions = (
  raw: string | null
): CustomProgression[] => {
  if (raw === null) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((item) => {
      const progression = parseCustomProgression(item)
      return progression ? [progression] : []
    })
  } catch {
    return []
  }
}
