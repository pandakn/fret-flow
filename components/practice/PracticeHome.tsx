"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AudioLines,
  Brain,
  ChevronDown,
  Clock3,
  Gauge,
  Guitar,
  Route,
  Shapes,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  buildDailyMissions,
  getMissionSessions,
  normalizeDailyChallengeState,
} from "@/lib/practice/challenges"
import { createDefaultExercise } from "@/lib/practice/exercises"
import { getLocalDayKey } from "@/lib/practice/statistics"
import { cn } from "@/lib/utils"
import type {
  DailyMission,
  ExerciseDefinition,
  ExerciseKind,
  RoutineDefinition,
} from "@/types/practice"
import { usePracticeStore } from "./hooks/usePracticeStore"
import { PracticeSession } from "./PracticeSession"
import { RoutineBuilder } from "./RoutineBuilder"
import { FretboardRecallSetup } from "./FretboardRecallSetup"
import { DailyMissionBoard } from "./DailyMissionBoard"
import { FretboardMasteryPath } from "./FretboardMasteryPath"

const EXERCISES: {
  kind: ExerciseKind
  icon: typeof Guitar
  label: string
  measure: string
}[] = [
  {
    kind: "fretboardRecall",
    icon: Brain,
    label: "Fretboard recall",
    measure: "Accuracy + response time",
  },
  {
    kind: "tempoLadder",
    icon: Gauge,
    label: "Tempo ladder",
    measure: "Comfortable + best BPM",
  },
  {
    kind: "technique",
    icon: Guitar,
    label: "Technique builder",
    measure: "Clean rounds by BPM",
  },
  {
    kind: "chordTransition",
    icon: Shapes,
    label: "Chord changes",
    measure: "Clean changes",
  },
  {
    kind: "earTraining",
    icon: AudioLines,
    label: "Ear training",
    measure: "Recognition accuracy",
  },
  {
    kind: "rhythm",
    icon: Activity,
    label: "Rhythm lock",
    measure: "Offset + consistency",
  },
  {
    kind: "positionConnection",
    icon: Route,
    label: "Position links",
    measure: "Sequence accuracy",
  },
  {
    kind: "construction",
    icon: Clock3,
    label: "Theory construction",
    measure: "Accuracy + response time",
  },
]

export function PracticeHome() {
  const { document, hydrated } = usePracticeStore()
  const [dayKey, setDayKey] = useState(() => getLocalDayKey(new Date()))
  const [routineOpen, setRoutineOpen] = useState(false)
  const [queue, setQueue] = useState<ExerciseDefinition[]>([])
  const [routineId, setRoutineId] = useState<string>()
  const [queueIndex, setQueueIndex] = useState(0)
  const [configuringRecall, setConfiguringRecall] = useState(false)
  const [mission, setMission] = useState<DailyMission>()
  const active = queue[queueIndex]
  const missions = useMemo(
    () =>
      buildDailyMissions({
        sessions: document.sessions,
        state: normalizeDailyChallengeState(
          document.dailyChallengeState,
          dayKey
        ),
        dayKey,
      }),
    [dayKey, document.dailyChallengeState, document.sessions]
  )
  const warmup = missions.find((dailyMission) => dailyMission.slot === "warmup")
  const warmupComplete = warmup
    ? getMissionSessions(document.sessions, warmup.id).length > 0
    : false
  const completedSessionCount = document.sessions.filter(
    (session) => session.status === "completed"
  ).length

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDayKey(getLocalDayKey(new Date()))
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const startExercise = (exercise: ExerciseDefinition) => {
    setQueue([exercise])
    setQueueIndex(0)
    setRoutineId(undefined)
    setMission(undefined)
  }
  const startMission = (nextMission: DailyMission) => {
    setQueue([nextMission.exercise])
    setQueueIndex(0)
    setRoutineId(undefined)
    setMission(nextMission)
  }
  const startRoutine = (routine: RoutineDefinition) => {
    setQueue(routine.blocks.map((block) => block.exercise))
    setQueueIndex(0)
    setRoutineId(routine.id)
    setMission(undefined)
  }
  const leaveSession = () => {
    if (routineId && queueIndex < queue.length - 1)
      setQueueIndex((index) => index + 1)
    else {
      setQueue([])
      setQueueIndex(0)
      setRoutineId(undefined)
      setMission(undefined)
    }
  }

  if (active) {
    return (
      <PracticeSession
        key={`${queueIndex}:${active.id}`}
        exercise={active}
        routineId={routineId}
        mission={mission}
        onExit={leaveSession}
        continueLabel={
          routineId && queueIndex < queue.length - 1
            ? "Next routine block"
            : undefined
        }
      />
    )
  }

  if (configuringRecall) {
    return (
      <div className="py-8">
        <FretboardRecallSetup
          onBack={() => setConfiguringRecall(false)}
          onStart={(exercise) => {
            setConfiguringRecall(false)
            startExercise(exercise)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <header className="grid gap-6 border-b pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase">
            Deliberate practice
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
            Turn fretboard knowledge into playing you can measure.
          </h1>
        </div>
        <div className="font-mono text-sm text-muted-foreground">
          {hydrated
            ? `${completedSessionCount} ${completedSessionCount === 1 ? "session" : "sessions"} logged`
            : "Loading practice history…"}
        </div>
      </header>

      <section
        aria-labelledby="todays-practice-heading"
        className="border border-[var(--border-2)] bg-card p-5 sm:p-7"
      >
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Today’s practice · {dayKey}
            </p>
            <h2
              id="todays-practice-heading"
              className="mt-2 text-2xl font-semibold sm:text-3xl"
            >
              Start where you are today.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {warmup
                ? `${warmup.exercise.name} · ${warmup.modifierLabel}. About ${warmup.durationMinutes} minutes to get moving.`
                : "A small, focused way to begin."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button
              className="min-h-11"
              disabled={!hydrated || !warmup}
              onClick={() => warmup && startMission(warmup)}
            >
              {warmupComplete ? "Replay quick warmup" : "Start quick warmup"}
            </Button>
            <Button
              className="min-h-11"
              variant="outline"
              onClick={() => setRoutineOpen(true)}
              aria-controls="practice-routine-builder"
              aria-expanded={routineOpen}
            >
              Build a full set
            </Button>
          </div>
        </div>
        <p className="mt-5 border-t pt-4 font-mono text-xs text-muted-foreground">
          {warmupComplete
            ? "Warmup logged today. You can replay it whenever you like."
            : "Even a short session counts as practice."}
        </p>
      </section>

      <Collapsible open={routineOpen} onOpenChange={setRoutineOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="min-h-11 w-full justify-between border-b px-0 text-left text-lg font-semibold"
          >
            Plan a full set
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                routineOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent id="practice-routine-builder" className="pt-5">
          <RoutineBuilder onStart={startRoutine} />
        </CollapsibleContent>
      </Collapsible>

      <DailyMissionBoard onStart={startMission} />

      <section aria-labelledby="more-practice-heading" className="space-y-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Explore at your pace
          </p>
          <h2
            id="more-practice-heading"
            className="mt-1 text-2xl font-semibold"
          >
            More ways to practice
          </h2>
        </div>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="min-h-11 w-full justify-between border-b px-0 text-left text-lg font-semibold"
            >
              Fretboard mastery path
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-5">
            <FretboardMasteryPath
              sessions={document.sessions}
              onStart={startExercise}
            />
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="min-h-11 w-full justify-between border-b px-0 text-left text-lg font-semibold"
            >
              Choose an individual drill
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-5">
            <section aria-labelledby="drills-heading">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    Focused work
                  </p>
                  <h3 id="drills-heading" className="text-2xl font-semibold">
                    Choose a drill
                  </h3>
                </div>
              </div>
              <div className="grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-4">
                {EXERCISES.map(({ kind, icon: Icon, label, measure }) => (
                  <Card
                    key={kind}
                    className="rounded-none border-0 shadow-none"
                  >
                    <CardHeader>
                      <Icon className="size-5" aria-hidden="true" />
                      <CardTitle className="pt-5 text-lg">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="min-h-10 text-sm text-muted-foreground">
                        {measure}
                      </p>
                      <Button
                        className="mt-5 w-full"
                        variant="outline"
                        onClick={() =>
                          kind === "fretboardRecall"
                            ? setConfiguringRecall(true)
                            : startExercise(createDefaultExercise(kind))
                        }
                      >
                        Start drill
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </CollapsibleContent>
        </Collapsible>

        {document.savedExercises.length > 0 ? (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="min-h-11 w-full justify-between border-b px-0 text-left text-lg font-semibold"
              >
                Saved exercises
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-5">
              <div className="flex flex-wrap gap-2">
                {document.savedExercises.map((exercise) => (
                  <Button
                    key={exercise.id}
                    variant="outline"
                    onClick={() => startExercise(exercise)}
                  >
                    {exercise.name}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </section>
    </div>
  )
}
