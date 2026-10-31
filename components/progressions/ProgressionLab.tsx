"use client"

import { useMemo, useRef, useState } from "react"
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
import { CHROMATIC } from "@/lib/notes"
import {
  getChordToneSpec,
  getProgressionsByGenre,
  getStepRootNote,
  PROGRESSION_GENRES,
  type Progression,
  type ProgressionGenreId,
} from "@/lib/progressions/catalog"
import { getStepChordNotes } from "@/lib/progressions/playback"
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

export function ProgressionLab() {
  const { t } = useI18n()
  const [genre, setGenre] = useState<ProgressionGenreId>("pop")
  const [key, setKey] = useState<NoteName>("C")
  const [loop, setLoop] = useState(true)
  const [selectedId, setSelectedId] = useState("pop_15_64")
  const [source, setSource] = useState<"library" | "quiz" | null>(null)
  const activePlaybackRef = useRef<PlaybackRequest | null>(null)
  const { play, stop, playing, currentStep } = useProgressionPlayback()

  const progressions = useMemo(() => getProgressionsByGenre(genre), [genre])
  const selected =
    progressions.find((item) => item.id === selectedId) ?? progressions[0]
  const [bpm, setBpm] = useState(selected?.bpm ?? 96)

  const selectGenre = (next: ProgressionGenreId) => {
    const first = getProgressionsByGenre(next)[0]
    setGenre(next)
    if (first) {
      setSelectedId(first.id)
      setBpm(first.bpm)
    }
    activePlaybackRef.current = null
    setSource(null)
    stop()
  }

  if (!selected) return null

  const libraryPlaying = playing && source === "library"

  const startPlayback = (
    request: PlaybackRequest,
    nextSource: "library" | "quiz"
  ) => {
    activePlaybackRef.current = request
    setSource(nextSource)
    play(request)
  }

  const playProgression = () => {
    if (libraryPlaying) {
      activePlaybackRef.current = null
      stop()
      setSource(null)
      return
    }
    startPlayback({ progression: selected, key, bpm, loop }, "library")
  }

  const playQuizProgression = (progression: Progression) => {
    startPlayback(
      { progression, key, bpm: progression.bpm, loop: false },
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

  const selectProgression = (progression: Progression) => {
    const restartPlayback = playing
    setSelectedId(progression.id)

    if (restartPlayback) {
      startPlayback({ progression, key, bpm, loop }, "library")
      return
    }

    activePlaybackRef.current = null
    stop()
    setSource(null)
  }

  const previewStep = (stepIndex: number) => {
    const step = selected.steps[stepIndex]
    if (!step) return
    startPlayback(
      {
        progression: { ...selected, steps: [step] },
        key,
        bpm,
        loop: false,
      },
      "library"
    )
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
            className={genrePill(genre === item)}
            aria-pressed={genre === item}
            onClick={() => selectGenre(item)}
          >
            {t(GENRE_LABEL_KEYS[item])}
          </Button>
        ))}
      </div>

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
                onValueChange={(value) => setBpm(value[0] ?? selected.bpm)}
                className="w-48"
              />
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
                className={pill(progression.id === selected.id)}
                aria-pressed={progression.id === selected.id}
                onClick={() => selectProgression(progression)}
              >
                {t(getProgressionLabelKey(progression.id))}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t(getProgressionLabelKey(selected.id))}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                  {t(getProgressionDescriptionKey(selected.id))}
                </p>
              </div>
              <Button
                type="button"
                onClick={playProgression}
                className="rounded-full"
              >
                {libraryPlaying ? t("stop") : t("playProgression")}
              </Button>
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
                  {step.romanNumeral} ·{" "}
                  {getStepRootNote(step, key)}
                  {getChordToneSpec(step.toneId)?.quality ?? ""}
                </Button>
              ))}
            </div>

            <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
              {selected.steps
                .flatMap((step) => getStepChordNotes(step, key))
                .filter(
                  (note, index, notes) => notes.indexOf(note) === index
                )
                .join(" · ")}
            </p>
          </div>
        </CardContent>
      </Card>

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
          key={genre}
          genre={genre}
          onPlay={playQuizProgression}
          playing={playing && source === "quiz"}
        />
      </section>
    </div>
  )
}
