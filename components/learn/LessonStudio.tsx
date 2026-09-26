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

const STAGES = ["learn", "visualize", "hear", "practice"] as const
type Stage = (typeof STAGES)[number]

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
  const [stage, setStage] = useState<Stage>("learn")
  const [key, setKey] = useState<NoteName>("C")
  const [intervalId, setIntervalId] = useState<IntervalName>("3")
  const [triadId, setTriadId] = useState("major")
  const [seventhId, setSeventhId] = useState("major_7")
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
    lessonId === "diatonic" && diatonicKind === "seventh" ? sevenths : triads
  const selectedDiatonic =
    diatonic[
      lessonId === "progressions"
        ? progression.degrees[progressionStep] - 1
        : degree - 1
    ]
  const selectedRoot =
    lessonId === "diatonic" || lessonId === "progressions"
      ? selectedDiatonic.root
      : key
  const chordId =
    lessonId === "triads"
      ? triadId
      : lessonId === "sevenths"
        ? seventhId
        : lessonId === "diatonic" || lessonId === "progressions"
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
  const pattern = lessonId === "intervals" ? intervalPattern : chord

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
    lessonId === "caged" && selectedShape
      ? cagedVoicings.find((item) => item.cagedShape === selectedShape.shape)
      : (voicings.find((item) => item.id === voicingId) ?? voicings[0])
  const arpeggio = useMemo(
    () =>
      selectedVoicing && chord && STANDARD_TUNING
        ? resolveArpeggio(selectedVoicing, chord, STANDARD_TUNING, "ascending")
        : undefined,
    [chord, selectedVoicing]
  )

  const progressionSequence = useMemo<PlaybackStep[]>(() => {
    if (lessonId !== "progressions" || !STANDARD_TUNING) return []
    return progression.degrees.flatMap((item) => {
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
  }, [diatonic, lessonId, progression])
  const hearSequence = useMemo<PlaybackStep[]>(() => {
    if (lessonId === "progressions") return progressionSequence
    if (lessonId === "intervals")
      return [{ interval: "R" }, { interval: intervalId }]
    if (hearMode === "arpeggio") return arpeggio?.steps ?? []
    const frequencies = selectedVoicing ? getFrequencies(selectedVoicing) : []
    return frequencies.length > 0 ? [{ interval: "R", frequencies }] : []
  }, [
    arpeggio,
    hearMode,
    intervalId,
    lessonId,
    progressionSequence,
    selectedVoicing,
  ])

  const chordLabel =
    lessonId === "diatonic" || lessonId === "progressions"
      ? formatChord(selectedDiatonic, key)
      : `${getKeyLabel(key)}${chord?.symbol ?? ""}`
  const practiceQuery = new URLSearchParams({
    lesson: lessonId,
    root: selectedRoot,
    chordId,
  })
  if (lessonId === "caged" && selectedShape) {
    practiceQuery.set("minFret", String(selectedShape.minFret))
    practiceQuery.set("maxFret", String(selectedShape.maxFret))
  }
  if (lessonId === "progressions") {
    const nextDegree =
      progression.degrees[(progressionStep + 1) % progression.degrees.length]
    practiceQuery.set("secondChord", formatChord(diatonic[nextDegree - 1], key))
  }
  const practiceHref = `${localePath(locale, "/practice")}?${practiceQuery.toString()}`
  const stageIndex = STAGES.indexOf(stage)

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
              {STAGES.map((item, index) => (
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
                  {t(`${item}Step`)}
                </Button>
              ))}
            </div>
          </aside>

          <section className="min-w-0" aria-live="polite">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] tracking-[0.17em] text-[var(--accent)] uppercase">
                0{stageIndex + 1} / 04 · {t(`${stage}Step`)}
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
                    lessonId={lessonId}
                    intervalId={intervalId}
                    setIntervalId={setIntervalId}
                    triadId={triadId}
                    setTriadId={setTriadId}
                    seventhId={seventhId}
                    setSeventhId={setSeventhId}
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
                        lessonId === "intervals" ? undefined : selectedVoicing
                      }
                      shapeFocus={lessonId === "caged"}
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
                    {lessonId !== "intervals" && lessonId !== "progressions" ? (
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
                        lessonId === "progressions"
                          ? t("playProgression")
                          : lessonId === "intervals"
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
                onClick={() => setStage(STAGES[stageIndex - 1])}
              >
                <ArrowLeft className="mr-2 size-4" aria-hidden />
                {t("previous")}
              </Button>
              {stageIndex < STAGES.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => setStage(STAGES[stageIndex + 1])}
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
  lessonId: LessonId
  intervalId: IntervalName
  setIntervalId: (value: IntervalName) => void
  triadId: string
  setTriadId: (value: string) => void
  seventhId: string
  setSeventhId: (value: string) => void
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
  const { lessonId } = props
  const pill = (selected: boolean) =>
    cn(
      "h-auto rounded-md px-3 py-1.5 font-mono text-xs",
      selected
        ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
        : "border border-[var(--border-2)] text-[var(--muted-foreground)]"
    )
  return (
    <div className="space-y-4">
      {lessonId === "intervals" ? (
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
      {lessonId === "triads" ? (
        <div className="flex gap-1.5" role="group" aria-label={t("chord")}>
          {(["major", "minor"] as const).map((id) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              className={pill(props.triadId === id)}
              aria-pressed={props.triadId === id}
              onClick={() => props.setTriadId(id)}
            >
              {t(id)}
            </Button>
          ))}
        </div>
      ) : null}
      {lessonId === "sevenths" ? (
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("chord")}
        >
          {(
            ["major_7", "minor_7", "dominant_7", "half_diminished_7"] as const
          ).map((id) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              className={pill(props.seventhId === id)}
              aria-pressed={props.seventhId === id}
              onClick={() => props.setSeventhId(id)}
            >
              {getChordById(id)?.symbol ?? id}
            </Button>
          ))}
        </div>
      ) : null}
      {lessonId === "caged" ? (
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
      {lessonId === "diatonic" ? (
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
      {lessonId === "progressions" ? (
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
      {lessonId === "sevenths" && props.voicings.length > 1 ? (
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
