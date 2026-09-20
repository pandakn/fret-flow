"use client"

import { useState } from "react"
import {
  Activity,
  AudioLines,
  Brain,
  Clock3,
  Gauge,
  Guitar,
  Route,
  Shapes,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createDefaultExercise } from "@/lib/practice/exercises"
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
  const [queue, setQueue] = useState<ExerciseDefinition[]>([])
  const [routineId, setRoutineId] = useState<string>()
  const [queueIndex, setQueueIndex] = useState(0)
  const [configuringRecall, setConfiguringRecall] = useState(false)
  const [mission, setMission] = useState<DailyMission>()
  const active = queue[queueIndex]

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
            ? `${document.sessions.filter((session) => session.status === "completed").length} sessions logged`
            : "Loading practice history…"}
        </div>
      </header>

      <DailyMissionBoard onStart={startMission} />

      <FretboardMasteryPath
        sessions={document.sessions}
        onStart={startExercise}
      />

      <RoutineBuilder onStart={startRoutine} />

      <section aria-labelledby="drills-heading">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              Focused work
            </p>
            <h2 id="drills-heading" className="text-2xl font-semibold">
              Choose a drill
            </h2>
          </div>
        </div>
        <div className="grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {EXERCISES.map(({ kind, icon: Icon, label, measure }) => (
            <Card key={kind} className="rounded-none border-0 shadow-none">
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

      {document.savedExercises.length > 0 ? (
        <section>
          <h2 className="text-2xl font-semibold">Saved exercises</h2>
          <div className="mt-4 flex flex-wrap gap-2">
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
        </section>
      ) : null}
    </div>
  )
}
