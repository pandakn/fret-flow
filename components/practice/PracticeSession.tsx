"use client"

import { Button } from "@/components/ui/button"
import { usePracticeSession } from "./hooks/usePracticeSession"
import { SessionSummary } from "./SessionSummary"
import { FretboardRecallDrill } from "./drills/FretboardRecallDrill"
import { TempoLadderDrill } from "./drills/TempoLadderDrill"
import { TechniqueDrill } from "./drills/TechniqueDrill"
import { ChordTransitionDrill } from "./drills/ChordTransitionDrill"
import { EarTrainingDrill } from "./drills/EarTrainingDrill"
import { RhythmDrill } from "./drills/RhythmDrill"
import { PositionConnectionDrill } from "./drills/PositionConnectionDrill"
import { ConstructionDrill } from "./drills/ConstructionDrill"
import type { ExerciseDefinition } from "@/types/practice"
import type { DailyMission } from "@/types/practice"
import { formatChallengeGoal } from "@/lib/practice/challenges"

const formatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

export function PracticeSession({
  exercise,
  routineId,
  onExit,
  continueLabel,
  mission,
}: {
  exercise: ExerciseDefinition
  routineId?: string
  onExit: () => void
  continueLabel?: string
  mission?: DailyMission
}) {
  const challenge = mission
    ? {
        id: mission.id,
        dayKey: mission.dayKey,
        slot: mission.slot,
        title: mission.title,
        goal: mission.goal,
        modifierLabel: mission.modifierLabel,
      }
    : undefined
  const practice = usePracticeSession(exercise, challenge)

  if (!practice.session) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Ready
        </p>
        <h1 className="mt-3 text-4xl font-semibold">{exercise.name}</h1>
        <p className="mt-4 max-w-lg text-muted-foreground">
          {exercise.description}
        </p>
        {mission ? (
          <div className="mt-5 border-y px-5 py-3 text-sm">
            <p className="font-medium">{formatChallengeGoal(mission.goal)}</p>
            <p className="mt-1 text-muted-foreground">
              {mission.modifierLabel}
            </p>
          </div>
        ) : null}
        <div className="mt-8 flex gap-3">
          <Button variant="ghost" onClick={onExit}>
            Back
          </Button>
          <Button size="lg" onClick={() => practice.start(routineId)}>
            Start session
          </Button>
        </div>
      </div>
    )
  }

  if (
    practice.session.status === "completed" ||
    practice.session.status === "abandoned"
  ) {
    return (
      <SessionSummary
        session={practice.session}
        onDone={onExit}
        doneLabel={continueLabel}
      />
    )
  }

  const sharedProps = {
    attempts: practice.session.attempts,
    onAttempt: practice.addAttempt,
    onFinish: practice.complete,
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Active session
          </p>
          <h1 className="text-xl font-semibold">{exercise.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-16 font-mono text-sm tabular-nums">
            {formatTime(practice.elapsedMs)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={
              practice.session.status === "paused"
                ? practice.resume
                : practice.pause
            }
          >
            {practice.session.status === "paused" ? "Resume" : "Pause"}
          </Button>
          <Button variant="ghost" size="sm" onClick={practice.abandon}>
            End
          </Button>
        </div>
      </header>

      {mission ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-l-2 border-[var(--color-root)] bg-muted/40 px-4 py-3 text-sm">
          <span className="font-medium">
            {formatChallengeGoal(mission.goal)}
          </span>
          <span className="text-muted-foreground">{mission.modifierLabel}</span>
        </div>
      ) : null}

      {practice.session.status === "paused" ? (
        <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Paused
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Take a breath</h2>
          <Button className="mt-6" onClick={practice.resume}>
            Resume session
          </Button>
        </div>
      ) : exercise.kind === "fretboardRecall" ? (
        <FretboardRecallDrill exercise={exercise} {...sharedProps} />
      ) : exercise.kind === "tempoLadder" ? (
        <TempoLadderDrill exercise={exercise} {...sharedProps} />
      ) : exercise.kind === "technique" ? (
        <TechniqueDrill exercise={exercise} {...sharedProps} />
      ) : exercise.kind === "chordTransition" ? (
        <ChordTransitionDrill exercise={exercise} {...sharedProps} />
      ) : exercise.kind === "earTraining" ? (
        <EarTrainingDrill exercise={exercise} {...sharedProps} />
      ) : exercise.kind === "rhythm" ? (
        <RhythmDrill exercise={exercise} {...sharedProps} />
      ) : exercise.kind === "positionConnection" ? (
        <PositionConnectionDrill exercise={exercise} {...sharedProps} />
      ) : (
        <ConstructionDrill exercise={exercise} {...sharedProps} />
      )}
    </div>
  )
}
