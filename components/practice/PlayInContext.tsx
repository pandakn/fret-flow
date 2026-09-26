"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMetronome } from "./hooks/useMetronome"
import type { ExerciseDefinition } from "@/types/practice"

export function getPlayInContextPrompt(
  exercise: ExerciseDefinition
): string | null {
  switch (exercise.kind) {
    case "technique":
      return `Improvise a short phrase in ${exercise.root} ${exercise.scaleId.replaceAll("_", " ")}. Use ${exercise.technique.replaceAll("-", " ")} in one bar, then answer it with a different phrase.`
    case "positionConnection":
      return `Make a short melody in ${exercise.root} ${exercise.scaleId.replaceAll("_", " ")}. Start in position ${exercise.fromPosition}, cross into position ${exercise.toPosition}, and return.`
    case "chordTransition":
      return `Play a simple groove with ${exercise.chordA} and ${exercise.chordB}. Change chords every bar, then try a different strumming pattern.`
    case "rhythm":
      return `Play one chord or muted strings using your ${exercise.pattern} rhythm. Leave space in the third bar, then come back on the beat.`
    case "tempoLadder":
      return "Play a riff you know at a comfortable tempo. Keep it musical and let every note land with the click."
    default:
      return null
  }
}

export function PlayInContext({
  exercise,
  onFinish,
}: {
  exercise: ExerciseDefinition
  onFinish: () => void
}) {
  const metronome = useMetronome({
    initialBpm:
      exercise.kind === "technique" || exercise.kind === "rhythm"
        ? exercise.bpm
        : exercise.kind === "tempoLadder"
          ? exercise.startBpm
          : 80,
    beatsPerBar: exercise.kind === "rhythm" ? exercise.beatsPerBar : 4,
  })
  const prompt = getPlayInContextPrompt(exercise)

  if (!prompt) return null

  const finish = () => {
    metronome.stop()
    onFinish()
  }

  return (
    <Card className="mx-auto max-w-2xl border-[var(--color-root)]/45 bg-card/80">
      <CardHeader className="text-center">
        <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Optional · play it in context
        </p>
        <CardTitle>Make it music</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-center">
        <p className="text-muted-foreground">
          Try four bars, then continue whenever you&apos;re ready.
        </p>
        <p className="text-lg leading-relaxed">{prompt}</p>
        <p className="font-mono text-sm text-muted-foreground">
          {metronome.bpm} BPM · click is optional
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            onClick={
              metronome.playing ? metronome.stop : () => void metronome.start()
            }
          >
            {metronome.playing ? "Stop click" : "Start click"}
          </Button>
          <Button onClick={finish}>View session summary</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          This is free play; it does not affect your exercise score.
        </p>
      </CardContent>
    </Card>
  )
}
