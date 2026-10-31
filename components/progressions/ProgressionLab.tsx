"use client"

import { useMemo, useRef, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { CHROMATIC } from "@/lib/notes"
import {
  getChordToneSpec,
  getProgressionsByGenre,
  getStepRootNote,
  PROGRESSION_GENRES,
  type CustomProgression,
  type PlayableProgression,
  type Progression,
  type ProgressionGenreId,
} from "@/lib/progressions/catalog"
import {
  createCustomProgression,
  CUSTOM_PROGRESSION_STORAGE_KEY,
  parseCustomProgressions,
  type CustomProgressionDraft,
} from "@/lib/progressions/custom"
import {
  getStepChordNotes,
  type PianoRhythm,
} from "@/lib/progressions/playback"
import type { MessageKey } from "@/lib/i18n/messages"
import type { NoteName } from "@/types/music"
import { cn } from "@/lib/utils"
import {
  useProgressionPlayback,
  type PlaybackRequest,
} from "./hooks/useProgressionPlayback"
import { QuizPanel } from "./QuizPanel"
import {
  getProgressionDescriptionKey,
  getProgressionLabelKey,
} from "./progressionMessages"
import { CustomProgressionEditor } from "./CustomProgressionEditor"

type CustomProgressionPanel =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; progression: CustomProgression }
  | { kind: "delete"; progression: CustomProgression }

type ProgressionCollection =
  | { kind: "genre"; genre: ProgressionGenreId }
  | { kind: "custom" }

const EMPTY_CUSTOM_PROGRESSIONS: CustomProgression[] = []

const isCustomProgression = (
  progression: PlayableProgression
): progression is CustomProgression => "kind" in progression

const GENRE_LABEL_KEYS: Record<ProgressionGenreId, MessageKey> = {
  pop: "pop",
  rnb: "rnb",
  jazz: "jazz",
  neo_soul: "neoSoul",
  blues: "blues",
  funk: "funk",
}

const pill = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] transition-colors",
    active
      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
      : "border-[var(--border-2)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
  )

/** Genre tabs are shouted; chord symbols and roman numerals keep their case. */
const genrePill = (active: boolean) => cn(pill(active), "uppercase")

const parsePianoRhythm = (value: string): PianoRhythm | null => {
  if (value === "sustained" || value === "quarter_notes") return value
  return null
}

export function ProgressionLab() {
  const { t } = useI18n()
  const [collection, setCollection] = useState<ProgressionCollection>({
    kind: "genre",
    genre: "pop",
  })
  const [key, setKey] = useState<NoteName>("C")
  const [pianoRhythm, setPianoRhythm] = useState<PianoRhythm>("sustained")
  const [loop, setLoop] = useState(true)
  const [selectedId, setSelectedId] = useState("pop_15_64")
  const [source, setSource] = useState<"library" | "quiz" | null>(null)
  const [customPanel, setCustomPanel] = useState<CustomProgressionPanel>({
    kind: "closed",
  })
  const activePlaybackRef = useRef<PlaybackRequest | null>(null)
  const { play, stop, playing, currentStep } = useProgressionPlayback()
  const {
    value: customProgressions,
    setValue: setCustomProgressions,
    hydrated: customProgressionsHydrated,
  } = useLocalStorage({
    key: CUSTOM_PROGRESSION_STORAGE_KEY,
    fallback: EMPTY_CUSTOM_PROGRESSIONS,
    parse: parseCustomProgressions,
  })

  const progressions = useMemo(
    () =>
      collection.kind === "custom"
        ? customProgressions
        : getProgressionsByGenre(collection.genre),
    [collection, customProgressions]
  )
  const selected =
    progressions.find((item) => item.id === selectedId) ?? progressions[0]
  const [bpm, setBpm] = useState(96)

  const selectGenre = (next: ProgressionGenreId) => {
    const first = getProgressionsByGenre(next)[0]
    setCollection({ kind: "genre", genre: next })
    setCustomPanel({ kind: "closed" })
    if (first) {
      setSelectedId(first.id)
      setBpm(first.bpm)
    }
    activePlaybackRef.current = null
    setSource(null)
    stop()
  }

  const selectCustomCollection = () => {
    setCollection({ kind: "custom" })
    setSelectedId(customProgressions[0]?.id ?? "")
    setCustomPanel({ kind: "closed" })
    activePlaybackRef.current = null
    setSource(null)
    stop()
  }

  const selectedCustom =
    selected && isCustomProgression(selected) ? selected : null
  const libraryPlaying = playing && source === "library"

  const progressionLabel = (progression: PlayableProgression) =>
    isCustomProgression(progression)
      ? progression.name
      : t(getProgressionLabelKey(progression.id))

  const progressionDescription = (progression: PlayableProgression) =>
    isCustomProgression(progression)
      ? t("customProgressionDescription")
      : t(getProgressionDescriptionKey(progression.id))

  const openCustomPanel = (panel: CustomProgressionPanel) => {
    activePlaybackRef.current = null
    stop()
    setSource(null)
    setCustomPanel(panel)
  }

  const startPlayback = (
    request: PlaybackRequest,
    nextSource: "library" | "quiz"
  ) => {
    activePlaybackRef.current = request
    setSource(nextSource)
    play(request)
  }

  const playProgression = () => {
    if (!selected) return
    if (libraryPlaying) {
      activePlaybackRef.current = null
      stop()
      setSource(null)
      return
    }
    startPlayback(
      { progression: selected, key, bpm, loop, pianoRhythm },
      "library"
    )
  }

  const playQuizProgression = (progression: Progression) => {
    startPlayback(
      {
        progression,
        key,
        bpm: progression.bpm,
        loop: false,
        pianoRhythm,
      },
      "quiz"
    )
  }

  const changeKey = (nextKey: NoteName) => {
    setKey(nextKey)
    if (!playing) return

    const activePlayback = activePlaybackRef.current
    if (!activePlayback) {
      stop()
      setSource(null)
      return
    }

    startPlayback({ ...activePlayback, key: nextKey }, source ?? "library")
  }

  const changePianoRhythm = (nextPianoRhythm: PianoRhythm) => {
    setPianoRhythm(nextPianoRhythm)
    if (!playing) return

    const activePlayback = activePlaybackRef.current
    if (!activePlayback) {
      stop()
      setSource(null)
      return
    }

    startPlayback(
      { ...activePlayback, pianoRhythm: nextPianoRhythm },
      source ?? "library"
    )
  }

  const selectProgression = (progression: PlayableProgression) => {
    const restartPlayback = playing
    setSelectedId(progression.id)
    setCustomPanel({ kind: "closed" })

    if (restartPlayback) {
      startPlayback({ progression, key, bpm, loop, pianoRhythm }, "library")
      return
    }

    activePlaybackRef.current = null
    stop()
    setSource(null)
  }

  const saveCustomProgression = (draft: CustomProgressionDraft) => {
    if (customPanel.kind !== "create" && customPanel.kind !== "edit") return

    const existing =
      customPanel.kind === "edit" ? customPanel.progression : undefined
    const progression = createCustomProgression({
      id: existing?.id ?? `custom-${crypto.randomUUID()}`,
      name: draft.name,
      steps: draft.steps,
    })

    setCustomProgressions((current) =>
      existing
        ? current.map((item) => (item.id === existing.id ? progression : item))
        : [...current, progression]
    )
    setSelectedId(progression.id)
    activePlaybackRef.current = null
    stop()
    setSource(null)
    setCustomPanel({ kind: "closed" })
  }

  const deleteCustomProgression = () => {
    if (customPanel.kind !== "delete") return

    const { progression } = customPanel
    const fallback = customProgressions.find(
      (item) => item.id !== progression.id
    )
    setCustomProgressions((current) =>
      current.filter((item) => item.id !== progression.id)
    )
    if (selectedId === progression.id) {
      setSelectedId(fallback?.id ?? "")
    }
    activePlaybackRef.current = null
    stop()
    setSource(null)
    setCustomPanel({ kind: "closed" })
  }

  const previewStep = (stepIndex: number) => {
    if (!selected) return

    const playPreview = (progression: PlayableProgression) =>
      startPlayback(
        { progression, key, bpm, loop: false, pianoRhythm },
        "library"
      )

    if (isCustomProgression(selected)) {
      const step = selected.steps[stepIndex]
      if (step) playPreview({ ...selected, steps: [step] })
      return
    }

    const step = selected.steps[stepIndex]
    if (step) playPreview({ ...selected, steps: [step] })
  }

  return (
    <div className="space-y-10">
      <div className="max-w-3xl">
        <p className="mb-4 font-mono text-xs tracking-[0.22em] text-[var(--accent)] uppercase">
          FretFlow / {t("musicTheory")}
        </p>
        <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
          {t("progressionLabTitle")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          {t("progressionLabIntro")}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label={t("progressions")}
      >
        {PROGRESSION_GENRES.map((item) => (
          <Button
            key={item}
            type="button"
            variant="ghost"
            className={genrePill(
              collection.kind === "genre" && collection.genre === item
            )}
            aria-pressed={
              collection.kind === "genre" && collection.genre === item
            }
            onClick={() => selectGenre(item)}
          >
            {t(GENRE_LABEL_KEYS[item])}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          className={genrePill(collection.kind === "custom")}
          aria-pressed={collection.kind === "custom"}
          onClick={selectCustomCollection}
        >
          {t("myProgressions")}
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {collection.kind === "custom"
              ? t("myProgressions")
              : t("progressions")}
          </h2>
          {collection.kind === "custom" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => openCustomPanel({ kind: "create" })}
            >
              <Plus aria-hidden="true" />
              {t("createProgression")}
            </Button>
          ) : null}
        </div>

        {progressions.length > 0 ? (
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={t("progression")}
          >
            {progressions.map((progression) => (
              <Button
                key={progression.id}
                type="button"
                variant="ghost"
                className={pill(progression.id === selected?.id)}
                aria-pressed={progression.id === selected?.id}
                onClick={() => selectProgression(progression)}
              >
                {progressionLabel(progression)}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            {customProgressionsHydrated
              ? t("noCustomProgressions")
              : t("loadingCustomProgressions")}
          </p>
        )}
      </section>

      {customPanel.kind === "create" || customPanel.kind === "edit" ? (
        <CustomProgressionEditor
          key={
            customPanel.kind === "edit" ? customPanel.progression.id : "create"
          }
          {...(customPanel.kind === "edit"
            ? { progression: customPanel.progression }
            : {})}
          onSave={saveCustomProgression}
          onCancel={() => setCustomPanel({ kind: "closed" })}
        />
      ) : null}

      {customPanel.kind === "delete" ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="text-sm">
            {t("confirmDeleteProgression")} {customPanel.progression.name}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCustomPanel({ kind: "closed" })}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteCustomProgression}
            >
              {t("delete")}
            </Button>
          </div>
        </div>
      ) : null}

      {selected ? (
        <Card className="rounded-xl border-[var(--border-2)] bg-[var(--surface2)]">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <label
                  htmlFor="progression-key"
                  className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
                >
                  {t("key")}
                </label>
                <Select
                  value={key}
                  onValueChange={(value) => changeKey(value as NoteName)}
                >
                  <SelectTrigger
                    id="progression-key"
                    className="w-32 rounded-md border-[var(--border-2)] bg-[var(--surface)]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHROMATIC.map((note) => (
                      <SelectItem key={note} value={note}>
                        {note}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="progression-bpm"
                  className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
                >
                  {t("bpm")} · {bpm}
                </label>
                <Slider
                  id="progression-bpm"
                  min={50}
                  max={160}
                  step={1}
                  value={[bpm]}
                  onValueChange={(value) => setBpm(value[0] ?? bpm)}
                  className="w-48"
                />
              </div>

              <div>
                <label
                  htmlFor="progression-piano-rhythm"
                  className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
                >
                  {t("pianoRhythm")}
                </label>
                <Select
                  value={pianoRhythm}
                  onValueChange={(value) => {
                    const nextRhythm = parsePianoRhythm(value)
                    if (nextRhythm) changePianoRhythm(nextRhythm)
                  }}
                >
                  <SelectTrigger
                    id="progression-piano-rhythm"
                    className="w-44 rounded-md border-[var(--border-2)] bg-[var(--surface)]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sustained">
                      {t("pianoSustained")}
                    </SelectItem>
                    <SelectItem value="quarter_notes">
                      {t("quarterNotes")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 pb-1 text-sm">
                <Switch checked={loop} onCheckedChange={setLoop} />
                {t("loop")}
              </label>

              {selected.swing ? (
                <span className="rounded-full border border-[var(--border-2)] px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase">
                  {t("swing")}
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {progressionLabel(selected)}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                    {progressionDescription(selected)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCustom ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t("editProgression")}
                        title={t("editProgression")}
                        onClick={() =>
                          openCustomPanel({
                            kind: "edit",
                            progression: selectedCustom,
                          })
                        }
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label={t("delete")}
                        title={t("delete")}
                        onClick={() =>
                          openCustomPanel({
                            kind: "delete",
                            progression: selectedCustom,
                          })
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    onClick={playProgression}
                    className="rounded-full"
                  >
                    {libraryPlaying ? t("stop") : t("playProgression")}
                  </Button>
                </div>
              </div>

              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label={t("chord")}
              >
                {selected.steps.map((step, index) => (
                  <Button
                    key={`${step.romanNumeral}-${index}`}
                    type="button"
                    variant="ghost"
                    className={pill(
                      source === "library" && currentStep === index
                    )}
                    aria-pressed={source === "library" && currentStep === index}
                    onClick={() => previewStep(index)}
                    title={t("playChord")}
                  >
                    {step.romanNumeral} · {getStepRootNote(step, key)}
                    {getChordToneSpec(step.toneId)?.quality ?? ""}
                  </Button>
                ))}
              </div>

              <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                {selected.steps
                  .flatMap((step) => getStepChordNotes(step, key))
                  .filter((note, index, notes) => notes.indexOf(note) === index)
                  .join(" · ")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {collection.kind === "genre" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("quizTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              {t("quizPrompt")}
            </p>
          </div>
          <QuizPanel
            key={collection.genre}
            genre={collection.genre}
            onPlay={playQuizProgression}
            playing={playing && source === "quiz"}
          />
        </section>
      ) : null}
    </div>
  )
}
