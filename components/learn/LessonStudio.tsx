"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { FretboardPanel } from "@/components/layout/FretboardPanel"
import { PlaybackControls } from "@/components/layout/PlaybackControls"
import type { PlaybackStep } from "@/components/layout/hooks/usePlayback"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/components/i18n/LocaleProvider"
import { resolveArpeggio } from "@/lib/arpeggios"
import {
  getCagedMajorVoicings,
  getChordVoicings,
  type ChordVoicing,
} from "@/lib/chord-voicings"
import { getChordById } from "@/lib/chords"
import { lessons, type LessonId } from "@/lib/i18n/lessons"
import { learningCopy } from "@/lib/i18n/learning"
import { getLesson } from "@/lib/learning/catalog"
import { localePath } from "@/lib/i18n/locales"
import { CHROMATIC } from "@/lib/notes"
import {
  getCagedMajorShapes,
  type CagedShapePosition,
} from "@/lib/theory/caged"
import {
  getDiatonicSevenths,
  getDiatonicTriads,
  type DiatonicChord,
  type DiatonicChordKind,
} from "@/lib/theory/diatonic"
import { getKeyLabel, spellNoteInKey } from "@/lib/theory/spelling"
import { getStringFrequencyAtFret, getTuningById } from "@/lib/tunings"
import { cn } from "@/lib/utils"
import type { IntervalName, NoteName, TonalPattern } from "@/types/music"
import type { LessonScene } from "@/types/learning"

type Stage = "learn" | "visualize" | "hear" | "quick-check" | "practice"

const INTERVALS: { id: IntervalName; semitones: number }[] = [
  { id: "2", semitones: 2 },
  { id: "b3", semitones: 3 },
  { id: "3", semitones: 4 },
  { id: "4", semitones: 5 },
  { id: "5", semitones: 7 },
  { id: "b7", semitones: 10 },
  { id: "7", semitones: 11 },
]

const PROGRESSIONS = [
  { id: "pop", degrees: [1, 5, 6, 4], label: "I–V–vi–IV" },
  { id: "cadence", degrees: [2, 5, 1], label: "ii–V–I" },
  { id: "classic", degrees: [1, 4, 5], label: "I–IV–V" },
] as const

const STANDARD_TUNING = getTuningById("standard")

const getFrequencies = (voicing: ChordVoicing): number[] =>
  STANDARD_TUNING
    ? voicing.activePositions.flatMap(({ string, fret }) => {
        const frequency = getStringFrequencyAtFret(
          STANDARD_TUNING,
          string,
          fret
        )
        return frequency === undefined ? [] : [frequency]
      })
    : []

function formatChord(chord: DiatonicChord, key: NoteName): string {
  return `${spellNoteInKey(key, chord.root)}${getChordById(chord.chordId)?.symbol ?? ""}`
}

export function LessonStudio({ lessonId }: { lessonId: LessonId }) {
  const { locale, t } = useI18n()
  const copy = lessons[locale][lessonId]
  const lesson = getLesson(lessonId)
  const scene: LessonScene = lesson?.scene ?? { kind: "interval" }
  const sceneKind = scene.kind
  const stages: readonly Stage[] = lesson?.activities ?? []
  const [stage, setStage] = useState<Stage>("learn")
  const [key, setKey] = useState<NoteName>("C")
  const [intervalId, setIntervalId] = useState<IntervalName>("3")
  const [selectedChordId, setSelectedChordId] = useState(() =>
    scene.kind === "chord" ? scene.chordIds[0] : "major"
  )
  const [degree, setDegree] = useState(1)
  const [diatonicKind, setDiatonicKind] = useState<DiatonicChordKind>("triad")
  const [shapeId, setShapeId] = useState("C")
  const [progressionId, setProgressionId] =
    useState<(typeof PROGRESSIONS)[number]["id"]>("pop")
  const [progressionStep, setProgressionStep] = useState(0)
  const [voicingId, setVoicingId] = useState<string>()
  const [showIntervals, setShowIntervals] = useState(false)
  const [hearMode, setHearMode] = useState<"chord" | "arpeggio">("chord")

  const progression =
    PROGRESSIONS.find((item) => item.id === progressionId) ?? PROGRESSIONS[0]
  const triads = useMemo(() => getDiatonicTriads(key), [key])
  const sevenths = useMemo(() => getDiatonicSevenths(key), [key])
  const diatonic =
    scene.kind === "diatonic" && diatonicKind === "seventh" ? sevenths : triads
  const selectedDiatonic =
    diatonic[
      scene.kind === "progression"
        ? progression.degrees[progressionStep] - 1
        : degree - 1
    ]
  const selectedRoot =
    scene.kind === "diatonic" || scene.kind === "progression"
      ? selectedDiatonic.root
      : key
  const chordId =
    scene.kind === "chord"
      ? selectedChordId
      : scene.kind === "diatonic" || scene.kind === "progression"
        ? selectedDiatonic.chordId
        : "major"
  const chord = getChordById(chordId)
  const intervalInfo =
    INTERVALS.find((item) => item.id === intervalId) ?? INTERVALS[2]
  const intervalPattern = useMemo<TonalPattern>(
    () => ({
      formula: [intervalInfo.semitones, 12 - intervalInfo.semitones],
      intervals: ["R", intervalInfo.id],
    }),
    [intervalInfo]
  )
  const pattern = scene.kind === "interval" ? intervalPattern : chord

  const shapes = useMemo(() => getCagedMajorShapes(key), [key])
  const selectedShape =
    shapes.find((item) => item.shape === shapeId) ?? shapes[0]
  const cagedVoicings = useMemo(
    () => (STANDARD_TUNING ? getCagedMajorVoicings(key, STANDARD_TUNING) : []),
    [key]
  )
  const voicings = useMemo(
    () =>
      STANDARD_TUNING && chord
        ? getChordVoicings(selectedRoot, chord.id, STANDARD_TUNING)
        : [],
    [chord, selectedRoot]
  )
  const selectedVoicing =
    scene.kind === "caged" && selectedShape
      ? cagedVoicings.find((item) => item.cagedShape === selectedShape.shape)
      : (voicings.find((item) => item.id === voicingId) ?? voicings[0])
  const arpeggio = useMemo(
    () =>
      selectedVoicing && chord && STANDARD_TUNING
        ? resolveArpeggio(selectedVoicing, chord, STANDARD_TUNING, "ascending")
        : undefined,
    [chord, selectedVoicing]
  )

  const progressionSequence: PlaybackStep[] =
    sceneKind === "progression" && STANDARD_TUNING
      ? progression.degrees.flatMap((item) => {
          const selected = diatonic[item - 1]
          const voicing = getChordVoicings(
            selected.root,
            selected.chordId,
            STANDARD_TUNING
          )[0]
          const frequencies = voicing ? getFrequencies(voicing) : []
          return frequencies.length > 0
            ? [{ interval: "R" as const, frequencies }]
            : []
        })
      : []
  const selectedFrequencies = selectedVoicing
    ? getFrequencies(selectedVoicing)
    : []
  const hearSequence: PlaybackStep[] =
    sceneKind === "progression"
      ? progressionSequence
      : sceneKind === "interval"
        ? [{ interval: "R" }, { interval: intervalId }]
        : hearMode === "arpeggio"
          ? (arpeggio?.steps ?? [])
          : selectedFrequencies.length > 0
            ? [{ interval: "R", frequencies: selectedFrequencies }]
            : []

  const chordLabel =
    scene.kind === "diatonic" || scene.kind === "progression"
      ? formatChord(selectedDiatonic, key)
      : `${getKeyLabel(key)}${chord?.symbol ?? ""}`
  const practiceQuery = new URLSearchParams({
    lesson: lessonId,
    key,
    root: selectedRoot,
    chordId,
  })
  if (scene.kind === "diatonic") practiceQuery.set("degree", String(degree))
  if (scene.kind === "progression")
    practiceQuery.set("degree", String(progression.degrees[progressionStep]))
  if (scene.kind === "caged" && selectedShape) {
    practiceQuery.set("minFret", String(selectedShape.minFret))
    practiceQuery.set("maxFret", String(selectedShape.maxFret))
  }
  if (scene.kind === "progression") {
    const nextDegree =
      progression.degrees[(progressionStep + 1) % progression.degrees.length]
    practiceQuery.set("secondChord", formatChord(diatonic[nextDegree - 1], key))
  }
  const practiceHref = `${localePath(locale, "/practice")}?${practiceQuery.toString()}`
  const quickCheckQuery = new URLSearchParams(practiceQuery)
  quickCheckQuery.set("mode", "quick-check")
  const quickCheckHref = `${localePath(locale, "/practice")}?${quickCheckQuery.toString()}`
  const stageIndex = stages.indexOf(stage)
  const stageLabel = (item: Stage) =>
    item === "quick-check" ? learningCopy[locale].quickCheck : t(`${item}Step`)

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href={localePath(locale, "/learn")}
          className="inline-flex items-center gap-2 font-mono text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> {t("backToLessons")}
        </Link>
        <header className="mt-6 border-b border-[var(--border-2)] pb-7">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)] uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            {copy.summary}
          </p>
        </header>

        <div className="mt-6 grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div>
              <label
                htmlFor="learn-key"
                className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
              >
                {t("key")}
              </label>
              <Select
                value={key}
                onValueChange={(value) => {
                  setKey(value as NoteName)
                  setVoicingId(undefined)
                }}
              >
                <SelectTrigger
                  id="learn-key"
                  className="w-full rounded-md border-[var(--border-2)] bg-[var(--surface2)]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHROMATIC.map((note) => (
                    <SelectItem key={note} value={note}>
                      {getKeyLabel(note)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className="grid grid-cols-4 gap-1 lg:grid-cols-1"
              role="group"
              aria-label={t("musicTheory")}
            >
              {stages.map((item, index) => (
                <Button
                  key={item}
                  type="button"
                  variant="ghost"
                  onClick={() => setStage(item)}
                  aria-current={stage === item ? "step" : undefined}
                  className={cn(
                    "h-auto justify-start rounded-md px-3 py-2 text-left text-xs",
                    stage === item
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--surface2)]"
                  )}
                >
                  <span className="mr-2 font-mono text-[10px]">
                    0{index + 1}
                  </span>
                  {stageLabel(item)}
                </Button>
              ))}
            </div>
          </aside>

          <section className="min-w-0" aria-live="polite">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] tracking-[0.17em] text-[var(--accent)] uppercase">
                0{stageIndex + 1} / 0{stages.length} · {stageLabel(stage)}
              </p>
              <span className="rounded-full border border-[var(--border-2)] px-3 py-1 font-mono text-xs">
                {chordLabel}
              </span>
            </div>

            {stage === "learn" ? (
              <div className="max-w-3xl py-4 sm:py-8">
                <p className="text-xl leading-relaxed font-medium sm:text-2xl">
                  {copy.learn}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {(pattern?.intervals ?? []).map((interval) => (
                    <span
                      key={interval}
                      className="rounded-full border border-[var(--border-2)] bg-[var(--surface2)] px-4 py-2 font-mono text-sm"
                    >
                      {interval}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {stage === "visualize" || stage === "hear" ? (
              <div className="space-y-5">
                <p className="max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                  {stage === "visualize" ? copy.visualize : copy.hear}
                </p>
                {stage === "visualize" ? (
                  <LessonControls
                    scene={scene}
                    intervalId={intervalId}
                    setIntervalId={setIntervalId}
                    selectedChordId={selectedChordId}
                    setSelectedChordId={setSelectedChordId}
                    diatonic={diatonic}
                    diatonicKind={diatonicKind}
                    setDiatonicKind={setDiatonicKind}
                    degree={degree}
                    setDegree={setDegree}
                    shapes={shapes}
                    shapeId={selectedShape?.shape ?? "C"}
                    setShapeId={setShapeId}
                    progression={progression}
                    progressionId={progressionId}
                    setProgressionId={(id) => {
                      setProgressionId(id)
                      setProgressionStep(0)
                    }}
                    progressionStep={progressionStep}
                    setProgressionStep={setProgressionStep}
                    voicings={voicings}
                    voicingId={selectedVoicing?.id}
                    setVoicingId={setVoicingId}
                    showIntervals={showIntervals}
                    setShowIntervals={setShowIntervals}
                  />
                ) : null}
                <Card className="overflow-hidden rounded-xl border-[var(--border-2)] bg-[var(--surface2)] py-5">
                  {pattern ? (
                    <FretboardPanel
                      root={selectedRoot}
                      pattern={pattern}
                      tuningId="standard"
                      colorPreset="minimal"
                      showNoteNames={!showIntervals}
                      showIntervals={showIntervals}
                      rootOnly={false}
                      selectedVoicing={
                        scene.kind === "interval" ? undefined : selectedVoicing
                      }
                      shapeFocus={scene.kind === "caged"}
                      arpeggio={
                        stage === "hear" && hearMode === "arpeggio"
                          ? arpeggio
                          : undefined
                      }
                    />
                  ) : null}
                </Card>
                {stage === "hear" ? (
                  <div className="max-w-sm">
                    {scene.kind !== "interval" &&
                    scene.kind !== "progression" ? (
                      <div
                        className="mb-3 flex gap-2"
                        role="group"
                        aria-label={t("howItSounds")}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant={hearMode === "chord" ? "default" : "outline"}
                          onClick={() => setHearMode("chord")}
                        >
                          {t("playChord")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            hearMode === "arpeggio" ? "default" : "outline"
                          }
                          onClick={() => setHearMode("arpeggio")}
                        >
                          {t("playArpeggio")}
                        </Button>
                      </div>
                    ) : null}
                    <PlaybackControls
                      root={selectedRoot}
                      sequence={hearSequence}
                      playLabel={
                        scene.kind === "progression"
                          ? t("playProgression")
                          : scene.kind === "interval"
                            ? t("playNotes")
                            : hearMode === "chord"
                              ? t("playChord")
                              : t("playArpeggio")
                      }
                      unavailableLabel={t("arpeggioUnavailable")}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {stage === "quick-check" ? (
              <div className="max-w-2xl py-4 sm:py-8">
                <h2 className="text-xl font-medium sm:text-2xl">
                  {learningCopy[locale].quickCheck}
                </h2>
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  {learningCopy[locale].checkIntro}
                </p>
                <Button asChild className="mt-7">
                  <Link href={quickCheckHref}>
                    {learningCopy[locale].quickCheck}
                    <ArrowRight className="ml-2 size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : null}

            {stage === "practice" ? (
              <div className="max-w-2xl py-4 sm:py-8">
                <p className="text-xl leading-relaxed font-medium sm:text-2xl">
                  {copy.practice}
                </p>
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  {t("practicePreview")}
                </p>
                <Button asChild className="mt-7">
                  <Link href={practiceHref}>
                    {t("openPractice")}{" "}
                    <ArrowRight className="ml-2 size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="mt-10 flex justify-between border-t border-[var(--border-2)] pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={stageIndex === 0}
                onClick={() => setStage(stages[stageIndex - 1])}
              >
                <ArrowLeft className="mr-2 size-4" aria-hidden />
                {t("previous")}
              </Button>
              {stageIndex < stages.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setStage(stages[stageIndex + 1])}
                >
                  {t("next")}
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

type LessonControlsProps = {
  scene: LessonScene
  intervalId: IntervalName
  setIntervalId: (value: IntervalName) => void
  selectedChordId: string
  setSelectedChordId: (value: string) => void
  diatonic: DiatonicChord[]
  diatonicKind: DiatonicChordKind
  setDiatonicKind: (value: DiatonicChordKind) => void
  degree: number
  setDegree: (value: number) => void
  shapes: CagedShapePosition[]
  shapeId: string
  setShapeId: (value: string) => void
  progression: (typeof PROGRESSIONS)[number]
  progressionId: (typeof PROGRESSIONS)[number]["id"]
  setProgressionId: (value: (typeof PROGRESSIONS)[number]["id"]) => void
  progressionStep: number
  setProgressionStep: (value: number) => void
  voicings: ChordVoicing[]
  voicingId?: string
  setVoicingId: (value: string) => void
  showIntervals: boolean
  setShowIntervals: (value: boolean) => void
}

function LessonControls(props: LessonControlsProps) {
  const { t } = useI18n()
  const { scene } = props
  const pill = (selected: boolean) =>
    cn(
      "h-auto rounded-md px-3 py-1.5 font-mono text-xs",
      selected
        ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
        : "border border-[var(--border-2)] text-[var(--muted-foreground)]"
    )
  return (
    <div className="space-y-4">
      {scene.kind === "interval" ? (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("degree")}
        >
          {INTERVALS.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              className={pill(props.intervalId === item.id)}
              aria-pressed={props.intervalId === item.id}
              onClick={() => props.setIntervalId(item.id)}
            >
              {item.id}
            </Button>
          ))}
        </div>
      ) : null}
      {scene.kind === "chord" ? (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("chord")}
        >
          {scene.chordIds.map((id) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              className={pill(props.selectedChordId === id)}
              aria-pressed={props.selectedChordId === id}
              onClick={() => props.setSelectedChordId(id)}
            >
              {id === "major" || id === "minor"
                ? t(id)
                : (getChordById(id)?.symbol ?? id)}
            </Button>
          ))}
        </div>
      ) : null}
      {scene.kind === "caged" ? (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("shape")}
        >
          {props.shapes.map((shape) => (
            <Button
              key={shape.shape}
              type="button"
              variant="ghost"
              className={pill(props.shapeId === shape.shape)}
              aria-pressed={props.shapeId === shape.shape}
              onClick={() => props.setShapeId(shape.shape)}
            >
              {shape.shape} · {shape.minFret}–{shape.maxFret}
            </Button>
          ))}
        </div>
      ) : null}
      {scene.kind === "diatonic" ? (
        <div className="space-y-3">
          <div className="flex gap-1.5" role="group" aria-label={t("chord")}>
            <Button
              type="button"
              variant="ghost"
              className={pill(props.diatonicKind === "triad")}
              aria-pressed={props.diatonicKind === "triad"}
              onClick={() => props.setDiatonicKind("triad")}
            >
              {t("triads")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={pill(props.diatonicKind === "seventh")}
              aria-pressed={props.diatonicKind === "seventh"}
              onClick={() => props.setDiatonicKind("seventh")}
            >
              {t("seventh")}
            </Button>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={t("selectDegree")}
          >
            {props.diatonic.map((chord) => (
              <Button
                key={chord.degree}
                type="button"
                variant="ghost"
                className={pill(props.degree === chord.degree)}
                aria-pressed={props.degree === chord.degree}
                onClick={() => props.setDegree(chord.degree)}
              >
                {chord.romanNumeral} ·{" "}
                {formatChord(chord, props.diatonic[0].root)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      {scene.kind === "progression" ? (
        <div className="space-y-3">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={t("progression")}
          >
            {PROGRESSIONS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                className={pill(props.progressionId === item.id)}
                aria-pressed={props.progressionId === item.id}
                onClick={() => props.setProgressionId(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label={t("chord")}
          >
            {props.progression.degrees.map((degree, index) => {
              const chord = props.diatonic[degree - 1]
              return (
                <Button
                  key={`${index}-${degree}`}
                  type="button"
                  variant="ghost"
                  className={pill(props.progressionStep === index)}
                  aria-pressed={props.progressionStep === index}
                  onClick={() => props.setProgressionStep(index)}
                >
                  {index + 1}. {chord.romanNumeral} ·{" "}
                  {formatChord(chord, props.diatonic[0].root)}
                </Button>
              )
            })}
          </div>
        </div>
      ) : null}
      {scene.kind === "chord" &&
      scene.showVoicings &&
      props.voicings.length > 1 ? (
        <div>
          <label
            htmlFor="lesson-voicing"
            className="mb-2 block font-mono text-[10px] tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
          >
            {t("voicing")}
          </label>
          <Select value={props.voicingId} onValueChange={props.setVoicingId}>
            <SelectTrigger
              id="lesson-voicing"
              className="rounded-md border-[var(--border-2)] bg-[var(--surface2)]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {props.voicings.map((voicing) => (
                <SelectItem key={voicing.id} value={voicing.id}>
                  {voicing.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="flex gap-1.5" role="group" aria-label={t("showNotes")}>
        <Button
          type="button"
          variant="ghost"
          className={pill(!props.showIntervals)}
          aria-pressed={!props.showIntervals}
          onClick={() => props.setShowIntervals(false)}
        >
          {t("showNotes")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={pill(props.showIntervals)}
          aria-pressed={props.showIntervals}
          onClick={() => props.setShowIntervals(true)}
        >
          {t("showIntervals")}
        </Button>
      </div>
    </div>
  )
}
